export default class CreateElectionAdmin {
  constructor(electionAdminId, firstname, lastname, address) {
    this.electionAdminId = electionAdminId; // mandatory
    this.firstname = firstname; //mandatory
    this.lastname = lastname; //mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
