// This Controller is generic so it distributed with the services in the base
class ReadModelGenericController {
    constructor(app, readRepository, logger) {
        app.get('/api/v1/r/:model', (req, res) => {
            readRepository.findWhere(req.params.model, req.query)
                .then(results => res.json(results))
                .catch(err => {
                    logger.error(err.stack);
                    res.status(500).json({message: err.message});
                });
        });
    }
}
module.exports = ReadModelGenericController;