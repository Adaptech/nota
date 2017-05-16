const esClient = require('eventstore-node');

function filter(rows, constraints) {
    if (!constraints) {
        return rows;
    }
    const filters = Object.getOwnPropertyNames(constraints).map(function (field) {
        const value = constraints[field];
        if (Array.isArray(value)) {
            return function (x) {
                return value.indexOf(x[field]) >= 0;
            }
        }
        return function (x) {
            return x[field] === value;
        }
    });
    return filters.reduce(function (results, f) {
        return results.filter(f);
    }, rows);
}

function ReadRepository(esConnection, logger) {
    const models = {};
    const readStore = {};

    const dependencyProvider = {
        get: function (modelName, constraints) {
            return filter(readStore[modelName], constraints);
        }
    };

    function parseData(buf) {
        try {
            return JSON.parse(buf.toString());
        } catch (e) {
            return null;
        }
    }

    // const userCredentials = new esClient.UserCredentials('admin', 'changeit')

    esConnection.subscribeToAllFrom(null, true,
        function (s, evData) {
            logger.info('Processing event', evData.originalEvent.eventType);
            try {
                const eventData = {
                    typeId: evData.originalEvent.eventType,
                    event: parseData(evData.originalEvent.data),
                    metadata: parseData(evData.originalEvent.metadata)
                };
                for (let k in models) {
                    readStore[k] = models[k].reducer.call(dependencyProvider, readStore[k], eventData);
                }
            } catch (e) {
                logger.error('Error processing event', e.stack);
            }
        },
        function () {
            logger.info('Live processing started.');
        },
        function (c, r, e) {
            logger.info('Subscription dropped.', c, r, e);
        },
        new esClient.UserCredentials('admin', 'changeit')
    );

    this.define = function (modelName, model) {
        if (!model) {
            throw new Error('model parameter is missing.');
        }
        if (!model.reducer) {
            throw new TypeError('model MUST have reducer property.');
        }
        logger.info('Defining model:', modelName);
        models[modelName] = model;
        readStore[modelName] = [];
    };

    this.findOne = function (modelName, constraints, noThrowOnError) {
        if (readStore[modelName] === undefined) {
            return Promise.reject(new Error(`${modelName} is not valid modelName.`));
        }
        return Promise.resolve(readStore[modelName])
            .then(rows => {
                return filter(rows, constraints);
            })
            .then(results => {
                if (results.length < 1 && !noThrowOnError) {
                    return Promise.reject(new Error(`No result found for ${modelName}.`));
                }
                return results[0];
            });
    };

    this.findAll = function (modelName) {
        if (readStore[modelName] === undefined) {
            return Promise.reject(new Error(`${modelName} is not valid modelName.`));
        }
        return Promise.resolve(readStore[modelName]);
    };

    this.findWhere = function (modelName, constraints) {
        if (readStore[modelName] === undefined) {
            return Promise.reject(new Error(`${modelName} is not valid modelName.`));
        }
        return Promise.resolve(readStore[modelName])
            .then(rows => {
                return filter(rows, constraints);
            });
    };
}

module.exports = ReadRepository;