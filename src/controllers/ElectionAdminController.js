import ElectionAdmin from '../domain/ElectionAdmin';
import CreateElectionAdmin from '../commands/CreateElectionAdmin';
import PostalAddress from '../domain/PostalAddress';

export default class ElectionAdminController {
  constructor(app, readRepository, commandHandler, logger) {
    function CreateElectionAdminHandler(req, res) {
      console.log(req.body)
      var params = req.body;
      var address = new PostalAddress(params.address.streetAddress, params.address.postOfficeBoxNumber, params.address.addressLocality, params.address.addressRegion, params.address.postalCode, params.address.addressCountry)
      const command = new CreateElectionAdmin(params.electionAdminId, params.firstname, params.lastname, address);
      commandHandler(command.electionAdminId, new ElectionAdmin(), command)
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
    app.post('/api/v1/electionadmin/create', CreateElectionAdminHandler);
   }
}