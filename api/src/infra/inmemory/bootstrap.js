const ReadRepository = require('../ReadRepository');
const TransactionalRepository = require('../TransactionalRepository');
const Subscriber = require('../Subscriber');
const Mapper = require('./Mapper');

function changeProxyFactory(obj) {
  const handler = {
    getChanges: function() {
      return obj;
    }
  };
  const proxy = new Proxy(obj, {});
  return {proxy, handler};
}

module.exports = function(services) {
  const {readModels, logger, esConnection, esClient, config} = services;
  const {eventStore: esConfig} = config;
  logger.info(`Initializing InMemory Storage...`);
  const mapper = new Mapper(readModels, {}, logger);
  const readRepository = new ReadRepository(mapper, logger);

  function transactionalRepositoryFactory(modelName) {
    return new TransactionalRepository(mapper, modelName, changeProxyFactory, logger);
  }

  function updateLastCheckPoint(pos) {
    logger.debug(pos);
  }

  const subscriber = new Subscriber(esClient, esConnection, readRepository, transactionalRepositoryFactory, readModels, esConfig, updateLastCheckPoint, logger);
  Object.assign(services, {
    readRepository,
    transactionalRepositoryFactory,
    subscriber
  });
  return subscriber.startFrom(null);
};