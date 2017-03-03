
export default class VoterRegistered {
  constructor(voterId, firstname, lastname, address) {
    this.voterId = voterId; 
    this.firstname = firstname; // mandatory
    this.lastname = lastname; // mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
