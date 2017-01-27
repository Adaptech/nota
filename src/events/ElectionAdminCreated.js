
export default class ElectionAdminCreated {
  constructor(electionAdminId, name, address) {
    this.electionAdminId = electionAdminId; 
    this.name = name; // mandatory
    this.address = address; // mandatory. MUST contain zip code.
  }
};
