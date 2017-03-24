/**
 * @public
 * @constructor
 * @param {int} referendumId       Globally unique referendumId. Mandatory.
 * @parm {int} voterId             Globally unique voterId. Mandatory.
 * @parm (string) vote.            A string that must match one of the options keys in the options object of the referendum. Mandatory.
 */
export default class VoteCast {
  constructor(referendumId, voterId, vote) {
    this.referendumId = referendumId;
    this.voterId = voterId;
    this.vote = vote;
  }

}