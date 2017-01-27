export default class CreateElectionAdmin {
  constructor(electionAdminId, name, address) {
    this.electionAdminId = electionAdminId; // mandatory
    this.name = name; //mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
