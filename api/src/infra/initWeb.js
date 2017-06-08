import path from "path";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import {json as jsonParser} from "body-parser";
import glob from "glob";
import {newInject} from "./utils";

const ReadModelGenericController = require("./ReadModelGenericController");

function registerControllers(services) {
  glob.sync(path.resolve(__dirname, '../controllers/**/*.js'))
    .forEach(filePath => {
      const module = require(filePath);
      const T = module.default ? module.default : module;
      services.logger.info('Registering controller:', T.name);
      newInject(T, services, true);
    });
}

/**
 * Initialize Web
 * @param {Object} services Services registry
 */
function initWeb(services) {
  const {config, readRepository, logger} = services;
  if (!config) {
    throw new Error('Missing config in services registry.');
  }
  if (!logger) {
    throw new Error('Missing logger in services registry.');
  }
  if (!readRepository) {
    throw new Error('Missing readRepository in services registry.');
  }
  const {http: httpConfig} = config;
  if (!httpConfig) {
    throw new Error('Missing "httpConfig" config section.');
  }

  const app = express();
  app.use(morgan(httpConfig.accessLogFormat || 'common'));
  app.use(cors({origin: true, credentials: true}));
  app.use(jsonParser());

  services.app = app;
  // healthz always returns 200 indicting service is running this is needed for kubernetes
  // it must not be authenticated
  app.get('/healthz', (req, res) => {
      res.set('Content-Type', 'text/html');
      res.status(200).send(`<!DOCTYPE html><html><head><title>App is healty</title></head></html>`);
  });
    
  // serve web application
  app.use('/', express.static(path.resolve(__dirname, '../../web/build')));
  // handle every other route with index.html, which will contain
  // a script tag to your application's JavaScript file(s).
  app.use('/duber-membership', express.static(path.resolve(__dirname, '../../web-membership/resources/public')));
  app.use(/^\/(?!api).*/, express.static(path.resolve(__dirname, '../../web/build')));

  registerControllers(services);
  new ReadModelGenericController(app, readRepository, logger);

  function listening() {
    logger.info('App ready and listening on port', httpConfig.httpPort);
  }

  if (httpConfig.useHttps) {
    const https = require('https');
    const fs = require('fs');
    const key = fs.readFileSync(httpConfig.keyFile);
    const cert = fs.readFileSync(httpConfig.certFile);
    https.createServer({
      key: key,
      cert: cert
    }, app).listen(httpConfig.httpPort, listening);
  } else {
    app.listen(httpConfig.httpPort, listening);
  }

  return Promise.resolve(services);
}

module.exports = initWeb;
