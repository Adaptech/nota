/* eslint no-console: 0 */
const ReadRepositorySyncWrapper = require('./ReadRepositorySyncWrapper');

function _processBatch(q, action) {
  const eventData = q.shift();
  if (!eventData) {
    return Promise.resolve();
  }
  const actionResult = action(eventData);
  return Promise
    .resolve(actionResult)
    .then(() => _processBatch(q, action));
}

function _consumeBatch(esConnection, startPosition, batchSize, esCredentials, action) {
  return esConnection
    .readAllEventsForward(startPosition, batchSize, true, esCredentials)
    .then(readAllResult => {
      return _processBatch(readAllResult.events, action)
        .then(() => readAllResult);
    });
}

function _consumeAllAsync(esConnection, action, esCredentials, startPosition) {
  const batchSize = 500;

  function consumeNext(position) {
    return _consumeBatch(esConnection, position, batchSize, esCredentials, action)
      .then(result => {
        if (result.isEndOfStream) {
          return result.nextPosition;
        }
        return consumeNext(result.nextPosition);
      });
  }

  return consumeNext(startPosition);
}
exports.consumeAllAsync = _consumeAllAsync;

function safeParseData(buf) {
  try {
    return JSON.parse(buf.toString());
  } catch (e) {
    return null;
  }
}

function getLocalEventType(esEventType, prefix) {
  if (!prefix) {
    return esEventType;
  }
  if (esEventType.indexOf(prefix) === 0) {
    return esEventType.substr(prefix.length);
  }
  return esEventType;
}
exports.getLocalEventType = getLocalEventType;

function toEventData(esData, prefix) {
  const {
    originalEvent: {
      eventId,
      eventType,
      data,
      metadata,
      createdEpoch
    }
  } = esData;
  return {
    eventId,
    typeId: getLocalEventType(eventType, prefix),
    event: safeParseData(data),
    metadata: safeParseData(metadata),
    creationTime: createdEpoch
  };
}
exports.toEventData = toEventData;

function processEvent(readRepository, repositoryFactory, readModels, prefix, esData, logger) {
  if (esData.originalEvent.eventType[0] === '$') {
    return Promise.resolve();
  }
  return readModels.reduce(
    (promise, readModel) => {
      return promise
        .then(() => {
          const eventData = toEventData(esData, prefix);
          const repository = repositoryFactory(readModel.name);
          const wrappedReadRepository = new ReadRepositorySyncWrapper(readRepository);
          return Promise.resolve(readModel.handler(repository, eventData, wrappedReadRepository))
            .then(() => repository.applyChanges());
        })
        .catch(err => {
          logger.error(err.stack, '\n', readModel, esData);
        });
    },
    Promise.resolve()
  );
}
exports.processEvent = processEvent;

/**
 * Rebuild all readModels
 * @param {EventStoreNodeConnection} esConnection
 * @param {ReadRepository} readRepository
 * @param {function} repositoryFactory
 * @param {object[]} readModels
 * @param {!string} prefix
 * @param {UserCredentials} esCredentials
 * @param {Position} startPosition
 * @param {Logger} logger
 * @returns {Promise<Position>}
 */
function rebuildAll(esConnection, readRepository, repositoryFactory, readModels, prefix, esCredentials, startPosition, logger) {
  return _consumeAllAsync(esConnection, ev => processEvent(readRepository, repositoryFactory, readModels, prefix, ev, logger), esCredentials, startPosition);
}
exports.rebuildAll = rebuildAll;

/**
 * @interface BuilderEventData
 * @property {string} typeId
 * @property {object} event
 * @property {object} metadata
 */