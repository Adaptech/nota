class ObjectChangeProxyHandler {
  constructor(prefix) {
    this._prefix = prefix || '';
    this._subHandlers = [];
    this._changesCount = 0;
    this._changes = {};
  }

  get(target, prop) {
    const value = target[prop];
    //console.log('get', target, prop, value);
    if (Array.isArray(value)) {
      // TODO optimize
      // for now we assume that requesting an array means we change it
      // Also we update the complete set
      this._changesCount = this._changesCount + 1;
      this._changes[`${this._prefix}${prop}`] = value;
      return value;
    }
    if (value && typeof value === 'object') {
      const objProxyHandler = new ObjectChangeProxyHandler(prop + '.');
      this._subHandlers.push(objProxyHandler);
      return new Proxy(value, objProxyHandler);
    }
    return value;
  }

  set(target, prop, value) {
    //console.log('set', target, prop, value);
    this._changes[`${this._prefix}${prop}`] = value;
    target[prop] = value;
  }

  getChanges() {
    const subChanges = this._subHandlers.map(x => x.getChanges());
    return Object.assign(this._changes, ...subChanges);
  }
}
module.exports = ObjectChangeProxyHandler;