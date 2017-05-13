import Organization from '../domain/Organization';
import CreateOrganization from '../commands/CreateOrganization';

export default class OrganizationController {
  constructor(app, readRepository, commandHandler, logger) {
    function CreateOrganizationHandler(req, res) {
      var params = req.body;
      const command = new CreateOrganization(params.organizationId, params.name, params.electionAdminId);
      commandHandler(command.organizationId, new Organization(), command)
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
    app.post('/api/v1/organization/create', CreateOrganizationHandler);
   }
}