
export default class ElectionAdminCreated {
  constructor(electionAdminId, firstname, lastname, address) {
    this.electionAdminId = electionAdminId; 
    this.firstname = firstname; // mandatory
    this.lastname = lastname; // mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
