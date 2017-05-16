import program from 'commander';
import requireDirectory from 'require-directory';
import map from 'lodash/map';
import merge from 'lodash/merge';

import Logger from '../src/services/Logger';
import initializeServices from './lib/initializeServices';

program
  .version('0.0.1')
  .option('-e, --env <env>', 'Environment', 'development')
  .option('-c, --config <config>', 'Config file', 'local')
  .parse(process.argv);

process.env.NODE_ENV = program.env;

const config = require(`../config/${program.config}.json`);
// allow for external configuration
if (process.env.PORT) config.httpPort = +process.env.PORT;
if (process.env.EVENTSTORE_SERVICE_URL) config.esEndPoint = process.env.EVENTSTORE_SERVICE_URL;

const logger = Logger;
const services = { logger, config };

(async () => {
  try {
    await initializeServices(services);
    const seeds = requireDirectory(module, './seeds');
    const aggregates = {};
    for (let [key, seed] of Object.entries(seeds)) { await seed.default(services, aggregates); };
    process.exit(0);
  } catch (err) {
    logger.error(err);
    process.exit(1);
  }
})();
