const uuid = require('uuid');
const {getTypeName} = require('./utils');

function commandHandlerFactory(esClient, esConnection, eventsMap, esConfig, logger) {
  const prefix = esConfig.namespace
    ? `${esConfig.namespace}.`
    : '';

  function getLocalEventType(esEventType) {
    if (!prefix) {
      return esEventType;
    }
    if (esEventType.indexOf(prefix) === 0) {
      return esEventType.substr(prefix.length);
    }
    return esEventType;
  }

  function getESEventType(event) {
    return `${prefix}${event.constructor.name}`;
  }

  function convertToTypedEvent(ev) {
    const eventJSON = ev.originalEvent.data.toString();
    const eventObject = JSON.parse(eventJSON);
    const eventType = getLocalEventType(ev.originalEvent.eventType);
    const eventClass = eventsMap[eventType];
    if (!eventClass) {
      throw new Error(`No event class registered for eventType "${eventType}".`);
    }
    eventObject.__proto__ = eventClass.prototype;
    return eventObject;
  }

  return function commandHandler(aggregateId, aggregate, command, metadata) {
    const start = Date.now();
    metadata = metadata || {};
    metadata.timestamp = start;
    const streamName = `${prefix}${aggregate.constructor.name}-${aggregateId}`;

    return esConnection.readStreamEventsForward(streamName, 0, 4096, true)
      .then(function(readResult) {
        if (!readResult.isEndOfStream) {
          //TODO fixme - not a priority it's a bad design to have Aggregate with long lived stream
          //bail out if there's more than 4k events, because we haven't read all events so expectedVersion != lastEventNumber
          throw new Error(`Not supported: Stream ${streamName} has more than 4k events.`);
        }
        readResult.events
          .map(convertToTypedEvent)
          .forEach(ev => aggregate.hydrate(ev));
        return readResult.lastEventNumber;
      })
      .then(function(lastEventNumber) {
        return Promise.all([lastEventNumber, aggregate.execute(command)]);
      })
      .then(function([lastEventNumber, events]) {
        const eventList = Array.isArray(events)
          ? events.map(ev => esClient.createJsonEventData(uuid.v4(), ev, metadata, getESEventType(ev)))
          : [esClient.createJsonEventData(uuid.v4(), events, metadata, getESEventType(events))];
        return {expectedVersion: lastEventNumber, events: eventList};
      })
      .then(function(uncommittedEvents) {
        return esConnection.appendToStream(streamName, uncommittedEvents.expectedVersion, uncommittedEvents.events);
      })
      .then(function() {
        const elapsedMs = Date.now() - start;
        const commandJson = JSON.stringify(command);
        logger.info(`Processing command ${getTypeName(command)} took ${elapsedMs} ms.`, commandJson);
        return command;
      })
  };
}
module.exports = commandHandlerFactory;

