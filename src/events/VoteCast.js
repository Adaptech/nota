/**
 * @public
 * @constructor
 * @param {int} referendumId       Globally unique referendumId. Mandatory.
 * @parm (string) vote.            A string that must match one of the options keys in the options object of the referendum. Mandatory.
 */
export default class VoteCast {
  constructor(referendumId, vote) {
    this.referendumId = referendumId;
    this.vote = vote;
  }

}