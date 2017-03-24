import CreateElectionAdmin from '../commands/CreateElectionAdmin';
import ElectionAdminCreated from '../events/ElectionAdminCreated';
import errors from '../domain/Errors';

export default class ElectionAdmin {
  //constructor() {
   // this._id = null;
  //}

  constructor(address) {
  this._id = null;
      this.address = address;
    }

  hydrate(evt) {
      if (evt instanceof ElectionAdminCreated) {
        this._onElectionAdminCreated(evt);
      } 
  }

  _onElectionAdminCreated(evt) {
    this._id = evt.electionAdminId;
  }

  execute(command) {
    if (command instanceof CreateElectionAdmin) {
      return this._CreateElectionAdmin(command);
    }
    throw new Error('Unknown command.');
  }

  isValidPostalCode(postalCode, countryCode) {
   var postalCodeRegex;
      switch (countryCode) {
          case "US":
              postalCodeRegex = /^([0-9]{5})(?:[-\s]*([0-9]{4}))?$/.test(postalCode);
              break;
          case "CA":
              postalCodeRegex = /^([A-Z][0-9][A-Z])\s*([0-9][A-Z][0-9])$/.test(postalCode);
              break;
          default:
              return true;
              break;

  }
  return postalCodeRegex;
  }

  _CreateElectionAdmin(command) {
    var validationErrors = [];
    if(this._id) {
      validationErrors.push({"field": "", "msg": "ElectionAdmin already exists."})
    }
    if(!command.electionAdminId) {
      validationErrors.push({"field": "electionAdminId", "msg": "ElectionAdmin id is a required field."});
    }
    if(!command.firstname) {
      validationErrors.push({"field": "firstname", "msg": "ElectionAdmin firstname is a required field."});
    }   
    if(!command.lastname) {
      validationErrors.push({"field": "lastname", "msg": "ElectionAdmin lastname is a required field."});
    }
    if(!this.isValidPostalCode(command.address.postalCode, command.address.addressCountry)) {
      validationErrors.push({"field": "postalCode", "msg": "Zip / Postal Code is invalid overall."});
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
    result.push(new ElectionAdminCreated(command.electionAdminId, command.firstname, command.lastname, command.address));
    return result;
  }
}
