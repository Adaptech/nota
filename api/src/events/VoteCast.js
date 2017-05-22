// Although the id of the voter is not directly associated with the vote cast, it is easy to correlate the preceeding 
// VoterHasVoted event which is being published in order to prevent people from voting multiple times.
// This is a problem - how do we keep votes secret?
export default class VoteCast {
  constructor(referendumId, vote) {
    this.referendumId = referendumId;
    this.vote = vote;
  }
}