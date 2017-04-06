import RegisterVoter from '../commands/RegisterVoter';
import VoterRegistered from '../events/VoterRegistered';
import errors from '../domain/Errors';

export default class Voter {
  constructor() {
    this._id = null;
  }

  hydrate(evt) {
      if (evt instanceof VoterRegistered) {
        this._onVoterRegistered(evt);
      }
  }

  _onVoterRegistered(evt) {
    this._id = evt.voterId;
  }

  execute(command) {
    if (command instanceof RegisterVoter) {
      return this._RegisterVoter(command);
    }
    throw new Error('Unknown command.');
  }

  _RegisterVoter(command) {
    var validationErrors = [];
    if(this._id) {
      validationErrors.push({"field": "", "msg": "Voter already exists."})
    }
    if(!command.voterId) {
      validationErrors.push({"field": "voterId", "msg": "Voter id is a required field."});
    }
    if(!command.firstname) {
      validationErrors.push({"field": "firstname", "msg": "Voter firstname is a required field."});
    }
    if(!command.lastname) {
      validationErrors.push({"field": "lastname", "msg": "Voter lastname is a required field."});
    }
    if(command.address && !command.address.postalCode) {
      validationErrors.push({"field": "postalCode", "msg": "Zip / Postal Code is a required field."});
    }
    if(command.address && !command.address.addressRegion) {
      validationErrors.push({"field": "addressRegion", "msg": "Address Region is a required field."});
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }
    var result = [];
    result.push(new VoterRegistered(command.voterId, command.firstname, command.lastname, command.address));
    return result;
  }
}
