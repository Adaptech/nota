const {filter} = require('../utils');

class Mapper {
  constructor(readModels, initialState, logger) {
    this._logger = logger;
    this._readStore = {};
    this._keys = {};
    readModels.forEach(readModel => {
      this._readStore[readModel.name] = initialState[readModel.name] || [];
      this._keys[readModel.name] = readModel.config && readModel.config.key
    });
  }

  /**
   * Insert payload into readModel's identified by modelName
   * If an object with the same key exists it is updated
   * @param {string} modelName
   * @param {Object} payload
   * @returns {Promise}
   */
  insert(modelName, payload) {
    if (!this._readStore[modelName]) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }
    const keyWhere = this._getKeyWhere(modelName, payload);
    if (!this._isCompleteKeyWhere(keyWhere)) {
      return Promise.reject(new Error(`Can't insert, missing primary key value(s) in payload.`));
    }
    const existing = this._findByKey(modelName, keyWhere);
    if (existing) {
      this._logger.debug('Found one with identical key, updating', modelName, payload);
      Object.assign(existing, payload);
      return Promise.resolve();
    }
    this._logger.debug('InMemory.insert', modelName, payload);
    this._readStore[modelName].push(payload);
    // this._logger.debug('Inserting', modelName, payload);
    return Promise.resolve()
  }

  /**
   * Update readModel(s) identified by modelName and filtered by constraints
   * @param {string} modelName
   * @param {Object} changes
   * @param {Object} where
   * @returns {Promise}
   */
  update(modelName, changes, where) {
    if (!this._readStore[modelName]) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }
    const rows = this._find(modelName, where);
    rows.forEach(row => {
      this._logger.debug('InMemory.update', row, changes, where);
      Object.assign(row, changes);
    });

    return Promise.resolve()
  }

  /**
   * Fetch readModel(s) identified by modelName and filtered by constraints
   * @param {string} modelName
   * @param {Filter|{}} filter
   * @returns {Promise.<ReadResult>}
   */
  select(modelName, filter) {
    if (!this._readStore[modelName]) {
      return Promise.reject(new Error(`There is no model registered for ${modelName}.`));
    }
    const results = this._find(modelName, filter.where);
    if (filter.order && filter.order.length > 0) {
      this._order(results, filter.order);
    }
    const total = results.length;
    if (!filter.skip && !filter.limit) {
      return Promise.resolve({results, total});
    }

    const skip = parseInt(filter.skip) || 0;
    const limit = parseInt(filter.limit) || (total - skip);
    const pagedResults = results.slice(skip, skip + limit);
    return Promise.resolve({
      results: pagedResults,
      total
    })
  }

  _find(modelName, where) {
    const rows = this._readStore[modelName];
    if (where) {
      return filter(rows, where);
    }
    return rows;
  }

  _order(rows, order) {
    const orders = _getOrders(order);
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

  _findByKey(modelName, keyWhere) {
    const rows = this._find(modelName, keyWhere);
    if (rows.length > 1) {
      throw new Error(`Duplicate entries found for ${modelName} with key ${keyWhere}.`);
    }
    return rows[0];
  }

  _isCompleteKeyWhere(keyWhere) {
    let count = 0;
    for (let k of Object.keys(keyWhere)) {
      count++;
      if (!keyWhere[k]) {
        return false;
      }
    }
    return (count > 0);
  }

  _getKeyWhere(modelName, payload) {
    const key = this._keys[modelName];
    if (typeof key === 'string') {
      return {[`${key}`]: payload[key]};
    }
    if (Array.isArray(key)) {
      return key.reduce((constraints, k) => {
        constraints[k] = payload[k];
        return constraints;
      }, {});
    }
    throw new Error(`Invalid key descriptor format for ${modelName}.`);
  }
}
module.exports = Mapper;

const Directions = {
  'ASC': 1,
  'DESC': -1
};

function _parseOrderValue(order) {
  const [propertyName, direction] = order.split(' ');
  const dir = Directions[direction.toUpperCase()];
  return [propertyName, dir || Directions.ASC]
}

function _getOrders(order) {
  if (!order) {
    return [];
  }
  if (typeof order === 'string') {
    return [_parseOrderValue(order)];
  }
  if (Array.isArray(order)) {
    return order.map(_parseOrderValue);
  }
  throw new Error(`Invalid type for order.`);
}