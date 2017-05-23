/* eslint no-console: 0, no-unused-vars: 0 */

require("babel-polyfill"); // regeneratorRuntime
require('./initialize'); // ensure environment variables exist

const {parseCommandLine} = require("./infra/utils");
const optionsDef = {l: 'lastPos'};
const options = parseCommandLine(optionsDef);
const configName = options.$args[0];
if (!configName) {
  console.log('Usage:', process.argv[0], process.argv[1], '[env]');
  process.exit(-1);
}

const config = require(`../config/${configName}.json`);
const Logger = require("./infra/Logger");
const initES = require("./infra/initES");
const initRead = require("./infra/initRead");
const initWrite = require("./infra/initWrite");
//const initServices = require("./services/bootstrap");
const initWeb = require("./infra/initWeb");

process.on('unhandledRejection', (reason, p) => {
  const errMsg = reason && (reason.stack || reason);
  logger.error('Possible unhandled promise rejection', p, errMsg);
});

const logger = new Logger(config.logLevel);
const services = {logger, config};
initES(services)
  .then(() => initRead(services))
  .then(() => initWrite(services))
  //.then(() => initServices(services))
  .then(() => initWeb(services))
  .catch(err => {
    logger.error(err);
    process.exit(-1);
  });