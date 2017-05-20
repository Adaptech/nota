const uuid = require('uuid');
const async = require('../async');
const {getTypeName} = require('../utils');

function toESData(event, creationTime) {
  return {
    originalEvent: {
      eventId: uuid.v4(),
      eventType: event.typeId,
      data: JSON.stringify(event.event),
      metadata: JSON.stringify(event.metadata),
      createdEpoch: event.creationTime || creationTime
    }
  }
}

function addEvent(goesClient, streamName, expectedVersion, event, metadata, eventType) {
  return new Promise((resolve, reject) => {
    goesClient.addEvent(streamName, expectedVersion, event, metadata, eventType, err => {
      if (err) {
        return reject();
      }
      resolve();
    })
  })
}

/**
 * Simple Wrapper converting GES to GoES
 * Note: This is a short term solution until we refactor for an abstraction
 */
class ESWrapper {
  constructor(goesClient, logger) {
    this._goesClient = goesClient;
    this._liveProcessings = [];
    this._logger = logger;
  }

  subscribeToAllFrom(lastCheckpoint, resolveLinkTos, eventAppeared, liveProcessingStarted/*, subscriptionDropped, credentials*/) {
    if (lastCheckpoint) {
      throw new Error('Not Implemented!');
    }
    this._goesClient.readAll((err, events) => {
      events.forEach(x => {
        eventAppeared({}, toESData(x));
      });
      this._liveProcessings.push(eventAppeared);
      liveProcessingStarted()
    })
  }

  readStreamEventsForward(streamName/*, startPos, batchSize, resolveLinkTos*/) {
    const parts = streamName.split('-');
    parts.shift();
    const streamId = parts.join('-');
    return new Promise((resolve, reject) => {
      this._goesClient.readStream(streamId, (err, events) => {
        if (err) {
          return reject(err);
        }
        resolve({events: events.map(toESData)});
      })
    })
  }

  appendToStream(streamName, expectedVersion, events) {
    const parts = streamName.split('-');
    parts.shift();
    const streamId = parts.join('-');
    return async.forEach(events, (eventData, index) => {
      return addEvent(this._goesClient, streamId, expectedVersion + 1 + index, eventData.event, eventData.metadata, eventData.typeId)
        .then(() => this._liveProcessing(eventData))
    });
  }

  createJsonEventData(eventId, event, metadata) {
    return {
      eventId,
      typeId: getTypeName(event),
      event,
      metadata
    }
  }

  _liveProcessing(eventData) {
    return async.forEach(this._liveProcessings, eventAppeared => {
      try {
        eventAppeared({}, toESData(eventData, Date.now()));
      } catch (err) {
        this._logger.error(err.stack);
      }
    });
  }
}
module.exports = ESWrapper;