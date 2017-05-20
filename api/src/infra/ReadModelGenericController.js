// This Controller is generic so it distributed with the services in the base
class ReadModelGenericController {
  constructor(app, readRepository, logger) {
    function handleResult(findPromise, res) {
      return findPromise
        .then(result => res.json(result))
        .catch(err => {
          logger.error(err.stack);
          res.status(500).json({message: err.message});
        });
    }

    function getFilter(req) {
      const {filter} = req.query;
      if (!filter) {
        return {};
      }
      if (typeof filter === 'string') {
        return JSON.parse(filter);
      }
      return filter;
    }

    app.get('/api/v1/r/:model', (req, res) => {
      const filter = getFilter(req);
      handleResult(readRepository.findByFilter(req.params.model, filter), res)
    });
    app.get('/api/v1/r/:model/findOne', (req, res) => {
      const filter = getFilter(req);
      const where = filter.where || {};
      handleResult(readRepository.findOne(req.params.model, where), res)
    })
  }
}
module.exports = ReadModelGenericController;