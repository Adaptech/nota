const getTypeName = require('../utils').getTypeName;
const uuid = require('uuid');
const esClient = require('eventstore-node');

function commandHandlerFactory(esConnection, eventsMap, logger) {
    function convertToTypedEvent(ev) {
        const eventJSON = ev.originalEvent.data.toString();
        const eventObject = JSON.parse(eventJSON);
        const eventClass = eventsMap[ev.originalEvent.eventType];
        if (!eventClass) throw new Error(`No event class registered for eventType "${ev.originalEvent.eventType}".`);
        eventObject.__proto__ = eventClass.prototype;
        return eventObject;
    }

    return function commandHandler(aggregateId, aggregate, command, metadata) {
        const start = Date.now();
        metadata = metadata || {};
        metadata.timestamp = start;
        const streamName = aggregate.constructor.name + '-' + aggregateId;

        return esConnection.readStreamEventsForward(streamName, 0, 4096, true)
            .then(function (readResult) {
                readResult.events
                    .map(convertToTypedEvent)
                    .forEach(ev => aggregate.hydrate(ev));
                return readResult.events.length;
            })
            .then(function (nbEventsRead) {
                const events = aggregate.execute(command);
                const eventList = events.map(ev => esClient.createJsonEventData(uuid.v4(), ev, metadata));
                return {expectedVersion: nbEventsRead - 1, events: eventList};
            })
            .then(function (uncommittedEvents) {
                return esConnection.appendToStream(streamName, uncommittedEvents.expectedVersion, uncommittedEvents.events);
            })
            .then(function (result) {
                const elapsedMs = Date.now() - start;
                const commandJson = JSON.stringify(command);
                logger.info(`Processing command ${getTypeName(command)}took ${elapsedMs} ms.`, commandJson);
                return result;
            });
    };
}
module.exports = commandHandlerFactory;