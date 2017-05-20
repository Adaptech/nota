const {deepResolve} = require("./utils");

class TransactionalRepository {
  constructor(mapper, modelName, changeProxyFactory, logger) {
    this._mapper = mapper;
    this._modelName = modelName;
    this._changeProxyFactory = changeProxyFactory;
    this._logger = logger;
    this._actions = [];
  }

  /**
   * Create an entity using payload
   * @param {object} payload
   */
  create(payload) {
    this._actions.push(() => {
      return deepResolve(payload)
        .then(rp => this._mapper.insert(this._modelName, rp));
    });
  }

  /**
   * Update one entity matching constraints with change
   * @param {object} where
   * @param {object|function} changes
   */
  updateOne(where, changes) {
    if (typeof changes === 'object') {
      return this._updateStatic(where, changes);
    }
    if (typeof changes === 'function') {
      this._actions.push(() => {
        return deepResolve(where)
          .then(rwhere => {
            return this._mapper
              .select(this._modelName, {where: rwhere})
              .then(result => this._processRow(result.results[0], changes))
              .then(deepResolve)
              .then(rchanges => [rchanges, rwhere]);
          })
          .then(([rchanges, rwhere]) => this._mapper.update(this._modelName, rchanges, rwhere));
      });
      return;
    }
    throw new Error('Invalid parameter for change, must be an object or a function.');
  }

  /**
   * Update multiple entities matching constraints with change
   * @param {object} constraints
   * @param {object} change
   */
  updateWhere(constraints, change) {
    if (typeof change === 'object') {
      return this._updateStatic(constraints, change);
    }
    if (typeof change === 'function') {
      //TODO updateWhere with function
      throw new Error('Not Implemented.');
    }
    throw new Error('Invalid parameter for change, must be an object or a function.');
  }

  remove() {
    //TODO remove
    throw new Error('Not Implemented.');
  }

  /**
   * Apply changes. DO NOT INVOKE THIS METHOD BY YOURSELF
   * @returns {Promise}
   */
  applyChanges() {
    return this._processNextAction() || Promise.resolve();
  }

  _processNextAction() {
    const action = this._actions.shift();
    if (!action) {
      return;
    }
    const promise = action();
    if (!promise) {
      return;
    }
    return promise.then(() => this._processNextAction());
  }

  _updateStatic(where, data) {
    this._actions.push(() => {
      return Promise
        .all([
          deepResolve(data),
          deepResolve(where)
        ])
        .then(([rdata, rwhere]) => this._mapper.update(this._modelName, rdata, rwhere));
    });
  }

  _processRow(row, change) {
    if (!row) return Promise.resolve({});
    const {handler, proxy} = this._changeProxyFactory(row);
    change(proxy);
    return handler.getChanges();
  }
}
module.exports = TransactionalRepository;