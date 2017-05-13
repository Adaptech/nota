export default class RegisterVoter {
  constructor(voterId, organizationId, firstname, lastname, address) {
    this.voterId = voterId; // mandatory
    this.organizationId = organizationId; // mandatory
    this.firstname = firstname; //mandatory
    this.lastname = lastname; //mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
