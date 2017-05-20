const path = require("path");
const glob = require("glob");
const commandHandlerFactory = require("./commandHandler");
const CommandActionHelper = require("./CommandActionHelper");

function loadEventsMap(logger) {
  return glob
    .sync(path.resolve(__dirname, '../events/*.js'))
    .reduce((eventsMap, filePath) => {
      const module = require(filePath);
      const T = module.default ? module.default : module;
      logger.info('Registering event:', T.name);
      eventsMap[T.name] = T;
      return eventsMap;
    }, {});
}

/**
 * Initialize CQRS write side
 * @param {Object} services Services registry
 * @returns {Promise}
 */
function initWrite(services) {
  const {config, esConnection, esClient, logger, readRepository} = services;
  if (!config) {
    throw new Error('Missing config in services registry.');
  }
  if (!esConnection) {
    throw new Error('Missing esConnection in services registry.');
  }
  if (!esClient) {
    throw new Error('Missing esClient in services registry.');
  }
  if (!logger) {
    throw new Error('Missing logger in services registry.');
  }
  if (!readRepository) {
    throw new Error('Missing readRepository in services registry.');
  }
  const {eventStore: esConfig} = config;
  if (!esConfig) {
    throw new Error('Missing eventStore section in config.');
  }
  const eventsMap = loadEventsMap(logger);
  const commandHandler = commandHandlerFactory(esClient, esConnection, eventsMap, esConfig, logger);
  const commandActionHelper = new CommandActionHelper(commandHandler, readRepository, logger);
  Object.assign(services, {eventsMap, commandHandler, commandHandlerFactory, commandActionHelper});
  return Promise.resolve();
}

module.exports = initWrite;