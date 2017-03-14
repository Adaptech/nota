import CreateReferendum from '../commands/CreateReferendum';
import ReferendumCreated from '../events/ReferendumCreated';
import errors from '../domain/Errors';

export default class Referendum {
  constructor() {
    this._id = null;
  }

  hydrate(evt) {
      if (evt instanceof ReferendumCreated) {
        this._onReferendumCreated(evt);
      } 
  }

  _onReferendumCreated(evt) {
    this._id = evt.referendumId;
  }

  execute(command) {
    if (command instanceof CreateReferendum) {
      return this._CreateReferendum(command);
    }
    throw new Error('Unknown command.');
  }

  _CreateReferendum(command) {
    var validationErrors = [];
    if(this._id) {
      validationErrors.push({"field": "", "msg": "Referendum already exists."})
    }
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(!command.proposal) {
      validationErrors.push({"field": "proposal", "msg": "Referendum proposal is a required field."});
    }   
    if(!command.name) {
      validationErrors.push({"field": "name", "msg": "Referendum name is a required field."});
    }   
    if(!command.options) {
      validationErrors.push({"field": "options", "msg": "Referendum options are required."});
    }
    if(command.options&&command.options.length < 2) {
      validationErrors.push({"field": "options", "msg": "At least two options are required."});
    }   
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  
    command.options.push("None of the above");
    var result = [];
    result.push(new ReferendumCreated(command.referendumId, command.name, command.proposal, command.options));
    return result;
  }
}
