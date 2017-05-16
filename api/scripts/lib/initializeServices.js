const path = require('path');
const urlParse = require('url').parse;
const esClient = require('eventstore-node');
const glob = require('glob');

const commandHandlerFactory = require('../../src/services/commandHandler');

function registerEvents(logger) {
  const eventsMap = {};
  glob.sync(path.join(__dirname, '..', '..', 'src', 'events', '*.js'))
    .forEach(filePath => {
      const module = require(filePath);
      const T = module.default ? module.default : module;
      logger.info('Registering event:', T.name);
      eventsMap[T.name] = T;
    });
  return eventsMap;
}

export default async (services) => {
  const { logger, config } = services;

  const parsedUrl = urlParse(config.esEndPoint);
  const esConnection = esClient.createConnection({ log: logger }, { host: parsedUrl.hostname, port: parsedUrl.port });
  esConnection.connect();
  await new Promise((resolve) => esConnection.once('connected', () => resolve()));
  services.esConnection = esConnection;

  const eventsMap = registerEvents(logger);
  services.eventsMap = eventsMap;
  const commandHandler = commandHandlerFactory(esConnection, eventsMap, logger);
  services.commandHandler = commandHandler;
}
