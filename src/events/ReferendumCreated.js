
export default class ReferendumCreated {
  constructor(referendumId, name, proposal, options) {
    this.referendumId = referendumId; 
    this.name = name; // mandatory
    this.proposal = proposal; // mandatory
    this.options = options; // mandatory
  }
};