export default class CreateReferendum {
  constructor(organizationId, name, electionAdminId) {
    this.organizationId = organizationId; 
    this.name = name; // mandatory
    this.electionAdminId = electionAdminId; // mandatory
  }
};