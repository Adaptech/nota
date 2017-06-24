export default class ReferendumProposalModified {
  constructor(referendumId, organizationId, proposal) {
    this.referendumId = referendumId; // mandatory
    this.organizationId = organizationId; // mandatory
    this.proposal = proposal; // mandatory
  }
};
