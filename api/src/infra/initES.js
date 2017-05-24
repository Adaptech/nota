const path = require('path');
/**
 * Initialize EventStore connection
 * @param {Object} services Services registry
 * @returns {Promise}
 */
function initES(services) {
  const {config} = services;
  if (!config) {
    throw new Error('Missing config in services registry.');
  }
  const {eventStore: esConfig} = config;
  if (!esConfig) {
    throw new Error('Missing "eventStore" config section.');
  }
  let bootstrap = null;
  try {
    bootstrap = require(path.resolve(__dirname, esConfig.type, 'bootstrap'));
  } catch (err) {
    return Promise.reject(new Error(`Can't find bootstrap for eventStore of type ${esConfig.type}: ${err.message}`));
  }
  return bootstrap(services, esConfig);
}

module.exports = initES;