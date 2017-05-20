import CreateOrganization from '../commands/CreateOrganization';
import OrganizationCreated from '../events/OrganizationCreated';
import ElectionAdminAppointed from '../events/ElectionAdminAppointed';

import errors from '../domain/Errors';

export default class Organization {
  constructor() {
    this._id = null;
    this._name = null;
  }

  hydrate(evt) {
      if (evt instanceof OrganizationCreated) {
        this._onOrganizationCreated(evt);
      }
  }

  _onOrganizationCreated(evt) {
    this._id = evt.organizationId;
  }

  execute(command) {
    if (command instanceof CreateOrganization) {
      return this._CreateOrganization(command);
    }
    throw new Error('Unknown command.');
  }

  _CreateOrganization(command) {
    var validationErrors = [];
    if(this._id) {
      validationErrors.push({"field": "", "msg": "Organization already exists."})
    }
    if(!command.organizationId) {
      validationErrors.push({"field": "organizationId", "msg": "Organization does not exist."});
    }
    if(!command.electionAdminId) {
      validationErrors.push({"field": "electionAdminId", "msg": "Organization admin id is a required field."});
    }
    if(!command.name) {
      validationErrors.push({"field": "name", "msg": "Organization name is a required field."});
    }   
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  

    var result = [];
    result.push(new OrganizationCreated(command.organizationId, command.name));
    result.push(new ElectionAdminAppointed(command.organizationId, command.electionAdminId));
    return result;
  }
}
