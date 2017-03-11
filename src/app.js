const configName = process.argv[2];
if (!configName) {
    console.log('Usage:', process.argv[0], process.argv[1], '[env]');
    process.exit(-1);
}

const path = require('path');
const express = require('express');
const cors = require('cors');
const jsonParser = require('body-parser').json;
const glob = require('glob');
const onResponse = require('on-response');
const esClient = require('eventstore-node');

const commandHandlerFactory = require('./services/commandHandler');
const ReadRepository = require('./services/ReadRepository');
const ReadModelGenericController = require('./services/ReadModelGenericController');

const newInject = require('./utils').newInject;
const Logger = require('./services/logger');

function wireUp(config, esConnection) {
    const app = express();
    app.use(cors());
    app.use(jsonParser());

    const eventsMap = registerEvents(Logger);
    const commandHandler = commandHandlerFactory(esConnection, eventsMap, Logger);
    const readRepository = new ReadRepository(esConnection, Logger);
    registerModels(readRepository);

    app.use(function (req, res, next) {
        const start = Date.now();
        onResponse(req, res, function (err, summary) {
            Logger.access(
                summary.request.remoteAddress,
                '-',
                req.user ? req.user.username : '-',
                '-',
                '"' + [summary.request.method, summary.request.url, 'HTTP/' + summary.request.httpVersion].join(' ') + '"',
                '"' + summary.request.userAgent + '"',
                '-',
                res.statusCode,
                summary.response.length || 0,
                Date.now() - start);
        });
        next();
    });

    app.use('/', express.static(path.join(__dirname, '..', 'web/public')));

    const services = {
        app: app,
        esConnection: esConnection,
        readRepository: readRepository,
        commandHandler: commandHandler,
        logger: Logger
    };
    registerControllers(services);
    new ReadModelGenericController(app, readRepository, Logger);

    app.use(function (err, req, res, next) {
        Logger.error(err.stack);
        res.status(500).send({message: err.message, code: err.code || 'unknown'});
    });

    function listening() {
        Logger.info('App ready and listening on port', config.httpPort);
    }

    if (config.useHttps) {
        const https = require('https');
        const fs = require('fs');
        const key = fs.readFileSync(config.keyFile);
        const cert = fs.readFileSync(config.certFile);
        https.createServer({
            key: key,
            cert: cert
        }, app).listen(config.httpPort, listening);
    } else {
        app.listen(config.httpPort, listening);
    }
}

function registerModels(readRepository) {
    glob.sync(path.join(__dirname, 'readModels', '*.js'))
        .forEach(filePath => {
            const model = require(filePath);
            const name = path.basename(filePath, '.js');
            readRepository.define(name, model);
        });
}

function registerControllers(services) {
    glob.sync(path.join(__dirname, 'controllers', '**/*.js'))
        .forEach(filePath => {
            const module = require(filePath);
            const T = module.default ? module.default : module;
            services.logger.info('Registering controller:', T.name);
            newInject(T, services);
        });
}

function registerEvents(logger) {
    const eventsMap = {};
    glob.sync(path.join(__dirname, 'events', '*.js'))
        .forEach(filePath => {
            const module = require(filePath);
            const T = module.default ? module.default : module;
            logger.info('Registering event:', T.name);
            eventsMap[T.name] = T;
        });
    return eventsMap;
}

const config = require('../config/' + configName + '.json');
const esConnection = esClient.createConnection({log: Logger}, config.esEndPoint);
esConnection.connect();
esConnection.once('connected', (tcpEndPoint) => {
    Logger.info('Connected to GES at', tcpEndPoint);
    wireUp(config, esConnection);
});