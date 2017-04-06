export default class RegisterVoter {
  constructor(voterId, firstname, lastname, address) {
    this.voterId = voterId; // mandatory
    this.firstname = firstname; //mandatory
    this.lastname = lastname; //mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
