/* eslint-env mocha */
import setUpReadModelTests from './infra/setUpReadModelTests';
import * as referendumResultsReadmodel from '../src/readModels/referendumResults.js';
import ReferendumCreated from '../src/events/ReferendumCreated';
import VoteCast from '../src/events/VoteCast';
import assert from 'assert';

describe('Referendum Results', function() {
  describe('Given that a referendum is created and has two options', function() {
    let referendumId = "referendum-1";
    let organizationId = "org-1";
    let name = "Elections"
    let proposal = "We should elect one of the following candidates"
    let options = ["Carl", "Myra"];

    let referendumCreated = new ReferendumCreated(referendumId, organizationId, name, proposal, options)
    let referendumResults = [];
    setUpReadModelTests({
      readModels: {referendumResults: referendumResultsReadmodel},
      events: [referendumCreated ],
      resultsSetter: result => referendumResults = result
    });

    it('the referendum must be in the referendum results', function() {
      assert.ok(referendumResults.length === 1)
      assert.equal(referendumResults[0].organizationId, organizationId)
      assert.equal(referendumResults[0].referendumId, referendumId)
    })
    it('the name of the referendum must be present', function() {
      assert.equal(referendumResults[0].name, name)
    })
    it('the proposal of the referendum must be present', function() {
      assert.equal(referendumResults[0].proposal, proposal)
    })
    it("must have the right number of options", function() {
      assert.equal(referendumResults[0].results.length, 2)
    })
    it('must have the first option', function() {
      assert.equal(referendumResults[0].results[0].name, "Carl")
      assert.equal(referendumResults[0].results[0].votes, 0)
    })
    it('must have the second option', function() {
      assert.equal(referendumResults[0].results[1].name, "Myra")
      assert.equal(referendumResults[0].results[1].votes, 0)
    })
  })
  describe('Given that a referendum is created and has two options', function() {
    let referendumId = "referendum-1";
    let organizationId = "org-1";
    let name = "Elections"
    let proposal = "We should elect one of the following candidates"
    let options = ["A", "B"];

    let referendumCreated = new ReferendumCreated(referendumId, organizationId, name, proposal, options)
    let voteCast = new VoteCast(referendumId, "A")
    let referendumResults = [];
    setUpReadModelTests({
      readModels: {referendumResults: referendumResultsReadmodel},
      events: [referendumCreated, voteCast ],
      resultsSetter: result => referendumResults = result
    });

    it('when a vote is cast for option A then the vote count for A goes up by 1.', function() {
      assert.equal(referendumResults[0].results[0].votes, 1)
    })
  })
})
