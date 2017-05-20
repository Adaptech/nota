const ObjectChangeProxyHandler = require('./ObjectChangeProxyHandler');

function objectChangeProxyFactory(obj) {
  const handler = new ObjectChangeProxyHandler();
  const proxy = new Proxy(obj, handler);
  return {proxy, handler};
}

module.exports = objectChangeProxyFactory;