const esClient = require("node-eventstore-client");

module.exports = function(services, esConfig) {
  const {logger} = services;
  if (!logger) {
    throw new Error('Missing logger in services registry.');
  }
  const settings = Object.assign({log: logger}, esConfig.settings);
  const esConnection = esClient.createConnection(settings, esConfig.endPoint);
  esClient.createPosition = function() {
    if (arguments[0] === null) {
      return null;
    }
    if (arguments.length === 1) {
      const {commitPosition, preparePosition} = arguments[0];
      return new esClient.Position(commitPosition, preparePosition);
    }
    if (arguments.length === 2) {
      return new esClient.Position(arguments[0], arguments[1]);
    }
    throw new Error(`Invalid number of arguments.`);
  };
  services.esClient = esClient;
  services.esConnection = esConnection;

  return new Promise((resolve, reject) => {
    esConnection.connect()
      .catch(reject);
    esConnection.once('connected', (tcpEndPoint) => {
      esConnection.removeListener('closed', onClosedBeforeConnected);
      logger.info('Connected to GES at', tcpEndPoint);
      esConnection.on('closed', () => {
        logger.info('Connection to GES lost. Terminating this process.');
        process.exit(-1);
      });
      resolve();
    });
    esConnection.once('closed', onClosedBeforeConnected);

    function onClosedBeforeConnected(reason) {
      reject(new Error(`Connection failed: ${reason}`));
    }
  });
};