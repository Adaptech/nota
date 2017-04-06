import Referendum from '../domain/Referendum';
import CreateReferendum from '../commands/CreateReferendum';

export default class ReferendumController {
  constructor(app, readRepository, commandHandler, logger) {
    function CreateReferendumHandler(req, res) {
      console.log(req.body)
      var params = req.body;
      var options = params.options;
      const command = new CreateReferendum(params.referendumId, params.name, params.proposal, options);
      commandHandler(command.referendumId, new Referendum(), command)
          .then(() => {
            res.status(202).json(command);
          })
          .catch(err => {
            if(err.name == "ValidationFailed") {
              res.status(400).json({message: err.message});
            } else {
              logger.error(err.stack);
              res.status(500).json({message: err.message});
            }
          });
    }
    app.post('/api/v1/referendum/create', CreateReferendumHandler);
   }
}