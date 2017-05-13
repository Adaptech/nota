// Organizations hold referendums, e.g. "British Columbia (=organization), as part of the 2017 provincial election,

export default class OrganizationCreated {
  constructor(organizationId, name, electionAdminId) {
    this.organizationId = organizationId; 
    this.name = name; // mandatory
    this.electionAdminId = electionAdminId; // mandatory
  }
};