import Voter from '../domain/Voter';
import RegisterVoter from '../commands/RegisterVoter';
import PostalAddress from '../domain/PostalAddress';

export default class VoterController {
  constructor(app, readRepository, commandHandler, logger) {
    function RegisterVoterHandler(req, res) {
      var params = req.body;
      var address = new PostalAddress(params.address.streetAddress, params.address.postOfficeBoxNumber, params.address.addressLocality, params.address.addressRegion, params.address.postalCode, params.address.addressCountry)
      const command = new RegisterVoter(params.voterId, params.organizationId, params.firstname, params.lastname, address);
      commandHandler(command.voterId, new Voter(), command)
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
    app.post('/api/v1/organization/voter/register', RegisterVoterHandler);
   }
}