const builder = require('./builder');
const async = require('./async');

class Subscriber {
  constructor(esClient, esConnection, readRepository, transactionalRepository, readModels, esConfig, updateLastCheckPoint, logger) {
    this._esClient = esClient;
    this._esConnection = esConnection;
    this._readRepository = readRepository;
    this._transactionalRepository = transactionalRepository;
    this._readModels = readModels;
    this._esCredentials = esConfig.credentials;
    this._prefix = esConfig.namespace ? `${esConfig.namespace}.` : '';
    this._logger = logger;
    this._updateLastCheckPoint = updateLastCheckPoint;
    this._promise = Promise.resolve();
  }

  /**
   * @param {Object} lastCheckpoint
   * @return Promise
   */
  startFrom(lastCheckpoint) {
    this._logger.info('Starting subscription from', lastCheckpoint);
    const deferredCompletion = async.defer();

    const liveProcessingStarted = () => {
      this._logger.info('Live processing started.');
      deferredCompletion.resolve();
    };
    const subscriptionDropped = (conn, reason, error) => {
      this._logger.info('Subscription dropped:', reason, error);
      if (error) {
        deferredCompletion.reject(error);
      }
    };

    this._esConnection.subscribeToAllFrom(
      this._esClient.createPosition(lastCheckpoint),
      true,
      this._eventAppeared.bind(this),
      liveProcessingStarted,
      subscriptionDropped,
      this._esCredentials);

    return deferredCompletion.promise;
  }

  _eventAppeared(subscription, esData) {
    this._logger.debug('Event Appeared', esData.originalEvent.eventType);
    this._promise = this._promise
      .then(() => builder.processEvent(this._readRepository, this._transactionalRepository, this._readModels, this._prefix, esData, this._logger))
      .then(() => this._updateLastCheckPoint(esData.originalPosition))
  }
}
module.exports = Subscriber;