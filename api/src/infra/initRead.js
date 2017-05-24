const path = require("path");
const glob = require("glob");

function loadReadModels(logger) {
  return glob
    .sync(path.resolve(__dirname, '../readModels/*.js'))
    .map(filePath => {
      const model = require(filePath);
      const name = path.basename(filePath, '.js');
      logger.info('Registering read model:', name);
      if (!model.config || !model.handler) {
        throw new Error(`ReadModel '${name}' module MUST have 'config' and 'handler' exports.`)
      }
      return {
        name,
        config: model.config,
        handler: model.handler
      }
    });
}

/**
 * Initialize CQRS read side
 * @param {Object} services Services registry
 * @returns {Promise}
 */
function initRead(services) {
  const {config, logger} = services;
  if (!config) {
    throw new Error('Missing config in services registry.');
  }
  if (!logger) {
    throw new Error('Missing logger in services registry.');
  }
  const {readModelStore} = config;
  if (!readModelStore) {
    throw new Error('Missing "readModelStore" in config.');
  }
  services.readModels = loadReadModels(logger);
  let bootstrap;
  try {
    bootstrap = require(path.resolve(__dirname, readModelStore, 'bootstrap'));
  } catch (err) {
    throw new Error(`Can't find bootstrap for read storage of type ${readModelStore}: ${err.message}`);
  }
  return bootstrap(services);
}

module.exports = initRead;