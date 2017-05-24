const {getTypeName} = require("../../src/infra/utils");
const ReadRepository = require("../../src/infra/ReadRepository");
const ReadRepositorySyncWrapper = require("../../src/infra/ReadRepositorySyncWrapper");
const TransactionalRepository = require("../../src/infra/TransactionalRepository");
const InMemoryMapper = require("../../src/infra/inmemory/Mapper");
const NoOpLogger = require("../../src/infra/NoOpLogger");
const async = require("../../src/infra/async");

function changeProxyFactory(obj) {
  const handler = {
    getChanges: function() {
      return obj;
    }
  };
  const proxy = new Proxy(obj, handler);
  return {proxy, handler};
}

function setUpReadModelTest({readModels, events, initialState, resultsSetter}) {
  if (!readModels) throw new Error('Missing readModels.');
  if (!events || !events.length) throw new Error('Missing event(s).');
  if (!resultsSetter) throw new Error('Missing resultsSetter.');
  const logger = new NoOpLogger();
  initialState = initialState || {};
  const eventsData = events.map(event => {
    return {
      event,
      typeId: getTypeName(event)
    }
  });
  const readModelList = Object.keys(readModels).map(name => {
    const {config, handler} = readModels[name];
    return {name, config, handler}
  });
  const readModelUnderTest = readModelList[0];

  beforeEach(done => {
    const mapper = new InMemoryMapper(readModelList, initialState, logger);
    const readRepository = new ReadRepositorySyncWrapper(new ReadRepository(mapper, logger));
    async
      .forEach(eventsData, eventData => {
        return async.forEach(readModelList, readModel => {
          const modelRepository = new TransactionalRepository(mapper, readModel.name, changeProxyFactory, logger);
          return Promise.resolve(readModel.handler(modelRepository, eventData, readRepository))
            .then(() => modelRepository.applyChanges())
        });
      })
      .then(() => readRepository.findAll(readModelUnderTest.name))
      .then(data => resultsSetter(data))
      .then(() => done())
      .catch(err => done(err))
  })
}
module.exports = setUpReadModelTest;
module.exports.default = setUpReadModelTest;