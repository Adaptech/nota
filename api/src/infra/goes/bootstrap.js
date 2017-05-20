const GoesClient = require('goes-client').client;
const ESWrapper = require('./ESWrapper');

module.exports = function(services, esConfig) {
  const {logger} = services;
  logger.info(`Initializing GoES Client with endPoint "${esConfig.endPoint}"...`);
  const goesClient = new GoesClient(esConfig.endPoint);
  services.esConnection = new ESWrapper(goesClient, logger);
  services.goesClient = goesClient;
  return Promise.resolve();
};