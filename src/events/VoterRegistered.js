// TODO: Voters should be able to register (and  later log in) via Google (OAUTH2). 
// The "RegisterVoter" command initiates a flow which requires voters to complete registration by logging in successfully before VoterRegistered occurs.
// (http://passportjs.org seems handy for this.)
export default class VoterRegistered {
  constructor(voterId, firstname, lastname, address) {
    this.voterId = voterId; 
    this.firstname = firstname; // mandatory
    this.lastname = lastname; // mandatory
    this.address = address; // mandatory. MUST contain zip or postal code.
    // TODO: this.email from OAUTH2. 
  }
};
