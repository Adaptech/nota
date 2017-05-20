/* eslint no-unused-vars: 0 */
const async = require('../async');
const {filter} = require('../utils');
const {Where, Order} = require('../queries');
const Indexes = require('./Indexes');

class Mapper {
  constructor(readModels, db, logger) {
    this._db = db;
    this._logger = logger;
    this._keys = readModels.reduce((acc, cur) => {
      acc[cur.name] = cur.config && cur.config.key;
      return acc;
    }, {});
    this._readModels = readModels.reduce((acc, cur) => {
      acc[cur.name] = cur;
      return acc;
    }, {});
  }

  insert(modelName, payload) {
    const model = this._readModels[modelName];
    if (!model) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }
    return this._save(model, payload);
  }

  update(modelName, changes, where) {
    const model = this._readModels[modelName];
    if (!model) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }
    const key = Indexes.getPrimaryKeyValue(model, where);
    if (Indexes.isCompleteKey(key)) {
      return this._db.get(key)
        .then(value => {
          const obj = JSON.parse(value);
          Object.assign(obj, changes);
          return this._save(model, obj);
        })
    }
    return this._find(model, where)
      .then(rows => {
        return async.forEach(rows, row => {
          Object.assign(row, changes);
          return this._save(model, row);
        })
      })
  }

  select(modelName, filter) {
    const model = this._readModels[modelName];
    if (!model) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }

    return this._find(model, filter.where)
      .then(results => {
        if (filter.order && filter.order.length > 0) {
          this._order(results, filter.order);
        }
        const total = results.length;
        if (!filter.skip && !filter.limit) {
          return {results, total}
        }

        const skip = parseInt(filter.skip) || 0;
        const limit = parseInt(filter.limit) || (total - skip);
        const pagedResults = results.slice(skip, skip + limit);
        return {
          results: pagedResults,
          total
        }
      })
  }

  dropModel(modelName) {
    this._logger.info(`Dropping ReadModel '${modelName}'...`);
    const keys = [];
    return new Promise((resolve, reject) => {
      this._db.createKeyStream({gte: `${modelName}!`, lte: `${modelName};`})
        .on('data', key => keys.push(key))
        .on('end', () => resolve(keys))
        .on('error', reject);
    }).then(keys => this._db.batch(keys.map(key => ({type: 'del', key}))))
  }

  getModelVersion(modelName) {
    return this._db.get(`model:${modelName}:version`)
      .catch(err => {
        if (err.type === 'NotFoundError') {
          return '1';
        }
        throw err;
      })
      .then(version => parseInt(version, 10));
  }

  setModelVersion(modelName, version) {
    this._logger.info(`Setting ReadModel '${modelName}' version to ${version}.`);
    return this._db.put(`model:${modelName}:version`, version.toString());
  }

  _save(model, payload) {
    const pkValue = Indexes.getPrimaryKeyValue(model, payload);
    if (!Indexes.isCompleteKey(pkValue)) {
      return Promise.reject(new Error(`Can't insert, missing primary key value(s) in payload.`));
    }
    const batch = [
      {type: 'put', key: pkValue, value: JSON.stringify(payload)}
    ];
    Indexes.getSecondaryKeys(model, payload)
      .forEach(sk => {
        batch.push({type: 'put', key: sk, value: pkValue});
      });
    return this._db.batch(batch);
  }

  /**
   * Load all results for a model
   * @param modelName
   * @returns {Promise<Array<Object>>}
   * @private
   */
  _loadAll(modelName) {
    return new Promise((resolve, reject) => {
      const lb = `${modelName}:`;
      const ub = `${modelName};`;
      const rows = [];
      this._db.createReadStream({gte: lb, lt: ub, keys: false, values: true})
        .on('data', data => rows.push(JSON.parse(data)))
        .on('end', () => resolve(rows))
        .on('error', reject);
    })
  }

  /**
   * Load using keys
   * @param keys
   * @returns {Promise.<Array<Object>>}
   * @private
   */
  _loadByKeys(keys) {
    return Promise.all(keys.map(key => this._db.get(key)))
      .then(rawValues => rawValues.map(JSON.parse));
  }

  /**
   * Find results matching where clause for model
   * @param {Object} model
   * @param {Object} where
   * @returns {Promise.<Array<Object>>}
   * @private
   */
  _find(model, where) {
    const primaryKey = model.config.key;
    const indexes = model.config.indexes || [];
    const _where = new Where(where);
    const findByPk = _where.getIndexConstraint(primaryKey);
    if (findByPk) {
      return this
        ._getPrimaryKeys(model.name, findByPk.operator, findByPk.value)
        .then(keys => this._loadByKeys(keys))
        .then(rows => filter(rows, where));
    }
    const findByIndex = indexes
      .map(index => _where.getIndexConstraint(index))
      .filter(x => x !== null)[0];
    if (findByIndex) {
      return this
        ._getIndexKeys(`${model.name}!${findByIndex.key}`, findByIndex.operator, findByIndex.value)
        .then(keys => this._loadByKeys(keys))
        .then(rows => filter(rows, where));
    }
    return this._loadAll(model.name)
      .then(rows => filter(rows, where));
  }

  _getPrimaryKeys(modelName, operator, value) {
    let options = {};
    let predicate = keyValue => true;
    const lowerBound = `${modelName}:`;
    const upperBound = `${modelName};`;
    switch (operator) {
      case '$eq':
        //TODO optimize
        options = {gte: `${modelName}:${value}`, lte: `${modelName}:${value}`};
        break;
      case '$lt':
        options = {gt: lowerBound, lt: `${modelName}:${value}`};
        break;
      case '$lte':
        options = {gt: lowerBound, lte: `${modelName}:${value}`};
        break;
      case '$gt':
        options = {gt: `${modelName}:${value}`, lt: upperBound};
        break;
      case '$gte':
        options = {gte: `${modelName}:${value}`, lt: upperBound};
        break;
      case '$between':
        options = {gte: `${modelName}:${value[0]}`, lte: `${modelName}:${value[1]}`};
        break;
      case '$inq':
        //TODO optimize
        value.sort();
        options = {gte: `${modelName}:${value[0]}`, lte: `${modelName}:${value[value.length - 1]}`};
        predicate = keyValue => value.includes(keyValue);
        break;
      case '$ilike':
        options = {gt: lowerBound, lt: upperBound};
        const pattern = value.replace(/_/g, '.').replace(/%/g, '.*');
        const regex = new RegExp(`^${pattern}$`, 'i');
        predicate = keyValue => regex.test(keyValue);
        break;
      case '$neq':
        options = {gt: lowerBound, lt: upperBound};
        predicate = keyValue => keyValue !== value;
        break;
      default:
        throw new Error(`${operator} not implemented.`);
    }
    return new Promise((resolve, reject) => {
      const keys = [];
      this._db.createKeyStream(options)
        .on('data', key => {
          if (predicate(key.split(':')[1])) {
            keys.push(key);
          }
        })
        .on('end', () => resolve(keys))
        .on('error', reject)
    });
  }

  _getIndexKeys(index, operator, value) {
    let options = {};
    let predicate = keyValue => true;
    const lowerBound = `${index}:`;
    const upperBound = `${index};`;
    switch (operator) {
      case '$eq':
        options = {gt: `${index}:${value}:`, lt: `${index}:${value};`};
        break;
      case '$lt':
        options = {gt: lowerBound, lt: `${index}:${value};`};
        break;
      case '$lte':
        options = {gt: lowerBound, lte: `${index}:${value};`};
        break;
      case '$gt':
        options = {gt: `${index}:${value}:`, lt: upperBound};
        break;
      case '$gte':
        options = {gte: `${index}:${value}:`, lt: upperBound};
        break;
      case '$between':
        options = {gte: `${index}:${value[0]}:`, lte: `${index}:${value[1]};`};
        break;
      case '$inq':
        value.sort();
        options = {gte: `${index}:${value[0]}:`, lte: `${index}:${value[value.length - 1]};`};
        break;
      case '$ilike':
        options = {gt: lowerBound, lt: upperBound};
        const pattern = value.replace(/_/g, '.').replace(/%/g, '.*');
        const regex = new RegExp(`^${pattern}$`, 'i');
        predicate = keyValue => regex.test(keyValue);
        break;
      case '$neq':
        options = {gt: lowerBound, lt: upperBound};
        predicate = keyValue => keyValue !== value;
        break;
      default:
        throw new Error(`${operator} not implemented.`);
    }
    return new Promise((resolve, reject) => {
      const keys = new Set();
      this._db.createReadStream(options)
        .on('data', data => {
          if (predicate(data.key.split(':')[1])) {
            keys.add(data.value)
          }
        })
        .on('end', () => resolve(Array.from(keys)))
        .on('error', reject)
    });
  }

  _order(rows, order) {
    const orders = new Order(order).getOrders();
    rows.sort((a, b) => {
      for (let order of orders) {
        const [field, direction] = order;
        if (a[field] < b[field]) {
          return -1 * direction;
        }
        if (a[field] > b[field]) {
          return 1 * direction;
        }
      }
      return 0;
    });
    return rows;
  }
}
module.exports = Mapper;