export default class VoterAuthenticated {
  constructor(referendumId, organizationId, voterId) {
    this.referendumId = referendumId; // mandatory    
    this.organizationId = organizationId; // mandatory    
    this.voterId = voterId; // mandatory
  }
};
