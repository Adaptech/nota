export default class CreateOrganization {
  constructor(organizationId, name, electionAdminId) {
    this.organizationId = organizationId;  // mandatory
    this.name = name; // mandatory
    this.electionAdminId = electionAdminId; // mandatory
  }
};