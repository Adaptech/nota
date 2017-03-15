// TODO: OrganizationCreated event, CreateOrganization command, "Organization" aggregate,  /organization/create REST endpoint (POST).
// Would be nice if we could secure the API via http://passportjs.org as part of this: For now, organizations can only be created by 
// a "superadmin": A config file contains his/her Google userId (The "sub" field from https://developers.google.com/identity/protocols/OpenIDConnect?hl=EN ).
// 
// Organizations hold referendums, e.g. "British Columbia (=organization), as part of the 2017 provincial election,
// is going to the polls (="holding a referendum") in the Delta South riding. So the provincial election would have many referenda, 
// one for every riding. We could add tags to referenda so they can be grouped together: For example, the VoteCast events
// for all referenda tagged "ProvincialElection_2017" could go into a custom read model which calculates the election results
// for the province (as opposed to individual ridings) based on the specific rules in place in this province of Canada.
//
// With luck, this should make for a fairly flexible system able to support  a wide range of electoral systems. 
//
