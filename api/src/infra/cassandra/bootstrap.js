const cassandra = require('cassandra-driver');
const ReadRepository = require('../ReadRepository');
const TransactionalRepository = require('../TransactionalRepository');
const Subscriber = require('../Subscriber');
const Mapper = require('./Mapper');
const objectChangeProxyFactory = require('./ObjectChangeProxy');

module.exports = function(services) {
  const {readModels, logger, esConnection, options, config} = services;
  const client = new cassandra.Client({contactPoints: config.cassandra.contactPoints});
  const mapper = new Mapper(client, config.cassandra.keySpace, readModels.filter(x => x.config), logger);
  const readRepository = new ReadRepository(mapper, logger);

  function transactionalRepositoryFactory(modelName) {
    return new TransactionalRepository(mapper, modelName, objectChangeProxyFactory, logger);
  }

  const subscriber = new Subscriber(esConnection, readRepository, transactionalRepositoryFactory, readModels, logger);
  Object.assign(services, {
    readRepository,
    subscriber
  });
  return client.connect()
    .then(() => subscriber.startFrom(options.lastPos));
};
