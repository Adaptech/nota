
export default class ReferendumCreated {
  constructor(referendumId, organizationId, name, proposal, options) {
    this.referendumId = referendumId; // mandatory
    this.organizationId = organizationId; // mandatory
    this.name = name; // mandatory
    this.proposal = proposal; // mandatory
    this.options = options; // mandatory
  }
};