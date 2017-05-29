import CreateReferendum from '../commands/CreateReferendum';
import DeleteReferendum from '../commands/DeleteReferendum';
import AuthenticateVoter from "../commands/AuthenticateVoter"
import OpenPolls from "../commands/OpenPolls"
import ClosePolls from "../commands/ClosePolls"
import CastVote from "../commands/CastVote"
import ReferendumCreated from '../events/ReferendumCreated';
import ReferendumDeleted from '../events/ReferendumDeleted';
import PollsOpened from '../events/PollsOpened';
import PollsClosed from '../events/PollsClosed';
import VoterAuthenticated from "../events/VoterAuthenticated"
import VoterHasVoted from "../events/VoterHasVoted"
import VoteCast from "../events/VoteCast"
import errors from '../domain/Errors';

export default class Referendum {
  constructor() {
    this._id = null;
    this._options = [];
    this._status = "created";
    this._authenticatedVoters = [];
    this._votersWhoHaveVoted = [];
  }

  hydrate(evt) {
    if (evt instanceof ReferendumCreated) {
      this._onReferendumCreated(evt);
    }
    if (evt instanceof PollsOpened) {
      this._onPollsOpened();
    }
    if (evt instanceof PollsClosed) {
      this._onPollsClosed();
    }
    if (evt instanceof VoterAuthenticated) {
      this._onVoterAuthenticated(evt);
    }
    if (evt instanceof VoterHasVoted) {
      this._onVoterHasVoted(evt);
    }
  }

  _onReferendumCreated(evt) {
    this._id = evt.referendumId;
    this._options = evt.options
  }

  _onPollsOpened() {
    this._status = "polls_open";
  }

  _onPollsClosed() {
    this._status = "polls_closed";
  }

  _onVoterAuthenticated(evt) {
    this._authenticatedVoters.push(evt.voterId);
  }

  _onVoterHasVoted(evt){
    this._votersWhoHaveVoted.push(evt.voterId);
  }

  execute(command) {
    if (command instanceof CreateReferendum) {
      return this._CreateReferendum(command);
    }
    if (command instanceof DeleteReferendum) {
      return this._DeleteReferendum(command);
    }
    if (command instanceof OpenPolls) {
      return this._OpenPolls(command);
    }
    if (command instanceof ClosePolls) {
      return this._ClosePolls(command);
    }
    if (command instanceof AuthenticateVoter) {
      return this._AuthenticateVoter(command);
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
    if(!command.organizationId) {
      validationErrors.push({"field": "organizationId", "msg": "Organization does not exist."});
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
    result.push(new ReferendumCreated(command.referendumId, command.organizationId, command.name, command.proposal, command.options));
    return result;
  }

  _DeleteReferendum(command) {
    var validationErrors = [];
    if(!this._id) {
      validationErrors.push({"field": "", "msg": "Referendum doesn't exist."})
    }
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(this._status === "polls_open") {
      validationErrors.push({ "field": "", "msg": "Can't delete. Polls are open."})
    }
    if(this._status === "polls_closed") {
      validationErrors.push({ "field": "", "msg": "Polls are closed. Can't delete a completed referendum."})
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  
    var result = [];
    result.push(new ReferendumDeleted(command.referendumId));
    return result;
  }

  _OpenPolls(command) {
    var validationErrors = [];
    if(!this._id) {
      validationErrors.push({"field": "", "msg": "Referendum does not exist."})
    }    
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(this._status === "polls_open") {
      validationErrors.push({"field": "", "msg": "Polls are already open."})      
    }
    if(this._status === "polls_closed") {
      validationErrors.push({"field": "", "msg": "Polls have already been closed."})      
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  
    var result = [];
    result.push(new PollsOpened(command.referendumId));
    return result;
  }

  _ClosePolls(command) {
    var validationErrors = [];
    if(!this._id) {
      validationErrors.push({"field": "", "msg": "Referendum does not exist."})
    }    
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(!(this._status === "polls_open")) {
      validationErrors.push({"field": "referendumId", "msg": "Polls are not open."})      
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  
    var result = [];
    result.push(new PollsClosed(command.referendumId));
    return result;
  }

  _AuthenticateVoter(command) {
    var validationErrors = [];
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(!command.organizationId) {
      validationErrors.push({"field": "organizationId", "msg": "Organization does not exist."});
    }
    if(this._status != "polls_open") {
      validationErrors.push({"field": "", "msg": "Polls are not open."})      
    }    
    if(!command.voterId) {
      validationErrors.push({"field": "voterId", "msg": "Voter id is a required field."});
    }
    var voter = command.voterList.find(function (v) { return v.voterId === command.voterId; });
    if(voter === undefined ) {
      validationErrors.push({"field": "voterId", "msg": "Voter is not on voter list"});
    }
    if(this._authenticatedVoters.indexOf(command.voterId) != -1) {
      validationErrors.push({"field": "voterId", "msg": "Voter has already voted"});      
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }  
    var result = [];
    result.push(new VoterAuthenticated(command.referendumId, command.organizationId, command.voterId));
    return result;
  }

  _CastVote(command){
    var validationErrors = [];
    if(!command.referendumId) {
      validationErrors.push({"field": "referendumId", "msg": "Referendum id is a required field."});
    }
    if(this._status != "polls_open") {
      validationErrors.push({"field": "", "msg": "Polls are not open."})      
    }    
    if(!command.vote) {
      validationErrors.push({"field": "vote", "msg": "Vote is a required field."});
    }
    if(!this._options.find((option)=>option === command.vote)){
      validationErrors.push({"field": "vote", "msg": "Option does not exist."});
    }
    if(this._authenticatedVoters.indexOf(command.voterId) === -1) {
      validationErrors.push({"field": "voterId", "msg": "Voter is not authenticated."});
    }
    if(this._votersWhoHaveVoted.indexOf(command.voterId) > -1) {
      validationErrors.push({"field": "voterId", "msg": "Voter has already voted."});
    }
    if(validationErrors.length > 0) {
      throw new errors.ValidationFailed(validationErrors);
    }
    var result = [];
    // This is a problem for ensuring votes are secret: VoterHasVoted followed so closely in time by VoteCast allows the two events to be correlated.
    result.push(new VoterHasVoted(command.referendumId, command.voterId));
    result.push(new VoteCast(command.referendumId, command.vote));
    return result;
  }
}
