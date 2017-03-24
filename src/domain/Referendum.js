import CreateReferendum from '../commands/CreateReferendum';
import ReferendumCreated from '../events/ReferendumCreated';
import CastVote from "../commands/CastVote"
import VoteCast from "../events/VoteCast"

import errors from '../domain/Errors';

export default class Referendum {
  constructor() {
    this._id = null;
    this._options = []
    this._voters = {}
  }

  hydrate(evt) {
      if (evt instanceof ReferendumCreated) {
        this._onReferendumCreated(evt);
      }
    if (evt instanceof VoteCast) {
      this._onVoteCast(evt);
    }
  }

  _onReferendumCreated(evt) {
    this._id = evt.referendumId;
    this._options = Object.keys(evt.options);
  }

  _onVoteCast(evt){
    this._voters[evt.voterId] = true;
  }

  execute(command) {
    if (command instanceof CreateReferendum) {
      return this._CreateReferendum(command);
    }
    if(command instanceof CastVote){
      return this._CastVote(command)
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
      validationErrors.push({"field": "optinos", "msg": "At least two options are required."});
    }   
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  

    command.options.push("None of the above");

    const optionsWithTallies = command.options.reduce(
        (accumulatingOptionsWithTallies, option)=>
        {
          accumulatingOptionsWithTallies[option]=0;
          return accumulatingOptionsWithTallies
        },
      {}
      );

    var result = [];
    result.push(new ReferendumCreated(command.referendumId, command.name, command.proposal, optionsWithTallies));
    return result;
  }


  _CastVote(command){
    var validationErrors = [];
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(!command.voterId) {
      validationErrors.push({"field": "voterId", "msg": "Voter id is a required field."});
    }
    if(!command.vote) {
      validationErrors.push({"field": "vote", "msg": "Vote is a required field."});
    }
    if(!this._options.find((option)=>option === command.vote)){
      validationErrors.push({"field": "vote", "msg": "Option does not exist."});
    }
    if(this._voters[command.voterId]){
      validationErrors.push({"field": "voterId", "msg": "Already voted on this referendum."});
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }

    var result = [];
    result.push(new VoteCast(command.referendumId, command.voterId, command.vote));
    return result;

  }
}
