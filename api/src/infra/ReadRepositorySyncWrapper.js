class ObjectPromiseProxyHandler {
  get(target, property) {
    if (property === 'then') {
      return Promise.prototype.then.bind(target);
    }
    return Promise.resolve(target)
      .then(obj => {
        return obj[property];
      });
  }
}

class ReadRepositorySyncWrapper {
  constructor(inner) {
    this._inner = inner;
  }

  findOne(modelName, where, noThrowOnNotFound) {
    const promise = this._inner.findOne(modelName, where, noThrowOnNotFound);
    return new Proxy(promise, new ObjectPromiseProxyHandler());
  }

  findWhere(modelName, where) {
    return this._inner.findWhere(modelName, where);
  }

  findAll(modelName) {
    return this._inner.findAll(modelName);
  }

  exists(modelName, where) {
    return this._inner.exists(modelName, where);
  }
}
module.exports = ReadRepositorySyncWrapper;