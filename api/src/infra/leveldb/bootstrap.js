const path = require('path');
const levelup = require('levelup');
const ReadRepository = require('../ReadRepository');
const TransactionalRepository = require('../TransactionalRepository');
const Subscriber = require('../Subscriber');
const Mapper = require('./Mapper');
const {promisify, promisifyInstance} = require('../utils');
const builder = require('../builder');

const _levelup = promisify(levelup).bind(levelup);

function changeProxyFactory(obj) {
  const handler = {
    getChanges: function() {
      return obj;
    }
  };
  const proxy = new Proxy(obj, handler);
  return {proxy, handler};
}

module.exports = function(services) {
  const {readModels, logger, esConnection, esClient, config} = services;
  const {eventStore: esConfig, levelDb: levelDbConfig} = config;
  const {credentials: esCredentials} = esConfig;
  logger.info(`Initializing LevelDB Storage...`);

  let mapper, readRepository, transactionalRepositoryFactory;
  return _levelup(path.resolve(levelDbConfig.dbDir))
    .then(db => {
      return promisifyInstance(db, ['get', 'put', 'batch']);
    })
    .then(db => {
      mapper = new Mapper(readModels, db, logger);
      readRepository = new ReadRepository(mapper, logger);
      transactionalRepositoryFactory = (modelName) => {
        return new TransactionalRepository(mapper, modelName, changeProxyFactory, logger);
      };
      function updateLastCheckPoint(lastCheckPoint) {
        return db.put('.lastCheckPoint', JSON.stringify(lastCheckPoint));
      }

      const subscriber = new Subscriber(esClient, esConnection, readRepository, transactionalRepositoryFactory, readModels, esConfig, updateLastCheckPoint, logger);

      Object.assign(services, {
        readRepository,
        transactionalRepositoryFactory,
        subscriber
      });
      return db;
    })
    .then(db => {
      return db.get('.lastCheckPoint').then(x => JSON.parse(x))
    })
    .catch(err => {
      if (err.type === 'NotFoundError') {
        return null;
      }
      throw err;
    })
    .then(async (lastCheckPoint) => {
      if (lastCheckPoint === null) return lastCheckPoint;
      const readModelsToUpdate = await getReadModelsToUpdate(readModels, mapper);
      if (!readModelsToUpdate.length) return lastCheckPoint;
      await dropModels(readModelsToUpdate, mapper);
      const prefix = esConfig.namespace ? `${esConfig.namespace}.` : "";
      const startPosition = esClient.positions.start;
      logger.info(`Rebuilding ReadModels: ${readModelsToUpdate.map(x => x.name).join(', ')}...`);
      await builder.consumeAllAsync(esConnection, ev => {
        if (ev.originalPosition.compareTo(lastCheckPoint) > 0) return;
        return builder.processEvent(readRepository, transactionalRepositoryFactory, readModels, prefix, ev, logger);
      }, esCredentials, startPosition);
      await updateModelsVersions(readModelsToUpdate, mapper);
      return lastCheckPoint;
    })
    .then(lastCheckPoint => {
      return services.subscriber.startFrom(lastCheckPoint);
    })
};

async function getReadModelsToUpdate(readModels, mapper) {
  const readModelsToUpdate = [];
  for (let i in readModels) {
    const readModel = readModels[i];
    const currentVersion = readModel.config.version || 1;
    const version = await mapper.getModelVersion(readModel.name);
    if (currentVersion !== version) {
      readModelsToUpdate.push(readModel)
    }
  }
  return readModelsToUpdate;
}

async function dropModels(readModels, mapper) {
  for (let i in readModels) {
    await mapper.dropModel(readModels[i].name);
  }
}

async function updateModelsVersions(readModels, mapper) {
  for (let i in readModels) {
    const readModel = readModels[i];
    await mapper.setModelVersion(readModel.name, readModel.config.version || 1);
  }
}