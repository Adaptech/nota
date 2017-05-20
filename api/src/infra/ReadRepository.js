const {deepResolve} = require("./utils");

class ReadRepository {
  constructor(mapper, logger) {
    this._mapper = mapper;
    this._logger = logger;
  }

  /**
   * Find one entity of a readModel matching where constraints
   * @param {string}  modelName       readModel name
   * @param {Object}  where           find entity matching the where
   * @param {boolean} [noThrowOnNotFound] Set to true if you don't want an error thrown if no result are found
   * @returns {Promise.<Object>}
   */
  findOne(modelName, where, noThrowOnNotFound) {
    if (!modelName) {
      throw new Error(`modelName can't null.`);
    }
    if (!where) {
      throw new Error(`where can't be null.`);
    }
    return deepResolve(where)
      .then(rwhere => this._mapper.select(modelName, {where: rwhere}))
      .then(result => {
        if ((!result || !result.results || !result.results[0]) && !noThrowOnNotFound) {
          let notFoundError = new Error(`No result found for ${modelName} with criteria ${JSON.stringify(where)}.`);
          notFoundError.code = 'NotFound';
          throw notFoundError;
        }
        return result.results[0];
      });
  }

  /**
   * Find multiple entities of a readModel
   * @param {string}      modelName   readModel name
   * @param {Object}      where       find entities matching the where constraints
   * @returns {Promise.<Object[]>}
   */
  findWhere(modelName, where) {
    if (!modelName) {
      throw new Error(`modelName can't null.`);
    }
    if (!where) {
      throw new Error(`where can't be null.`);
    }
    return deepResolve(where)
      .then(rwhere => this._mapper.select(modelName, {where: rwhere}))
      .then(result => result.results);
  }

  /**
   * Find by filter
   * @param {string}  modelName
   * @param {Filter|{}}  filter
   * @returns {Promise.<ReadResult|Object[]>}
   */
  findByFilter(modelName, filter) {
    return deepResolve(filter)
      .then(rfilter => this._mapper.select(modelName, rfilter))
      .then(result => {
        if (filter.paging) {
          return result;
        }
        return result.results;
      })
  }

  /**
   * Find all entities of a readModel
   * @param {string} modelName    readModel name
   * @returns {Promise.<Object[]>}
   */
  findAll(modelName) {
    return this._mapper.select(modelName, {})
      .then(result => result.results);
  }

  /**
   * Does an entity exists
   * @param {string} modelName    readModel name
   * @param {Object} where        entity matching the where constraints
   * @returns {Promise.<boolean>}
   */
  exists(modelName, where) {
    return deepResolve(where)
      .then(rwhere => this._mapper.select(modelName, {where: rwhere}))
      .then(result => {
        return (result && result.results && result.results.length > 0)
      })
  }
}
module.exports = ReadRepository;

/**
 * @interface Filter
 * @property {?Object} where
 * @property {?string|string[]} order
 * @property {?number} skip
 * @property {?number} limit
 */

/**
 * @interface ReadResult
 * @property {Object[]} results
 * @property {?number}  total
 */