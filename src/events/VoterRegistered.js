export default class VoterRegistered {
  constructor(voterId, organizationId, firstname, lastname, address) {
    this.voterId = voterId; 
    this.organizationId = organizationId; // mandatory    
    this.firstname = firstname;
    this.lastname = lastname; 
    this.address = address; 
    // TODO: this.email from OAUTH2. 
  }
};
