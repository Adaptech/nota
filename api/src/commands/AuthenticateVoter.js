export default class AuthenticateVoter {
  constructor(referendumId, organizationId, voterId, voterList) {
    this.referendumId = referendumId; // mandatory
    this.organizationId = organizationId; // mandatory
    this.voterId = voterId; // mandatory
    this.voterList = voterList; // mandatory
  }
};