/* eslint-env mocha */
import setUpReadModelTests from './infra/setUpReadModelTests';
import * as referendumResultsReadmodel from '../src/readModels/results.js';
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
    let results = [];
    setUpReadModelTests({
      readModels: {results: referendumResultsReadmodel},
      events: [referendumCreated ],
      resultsSetter: result => results = result
    });

    it('the referendum must be in the referendum results', function() {
      assert.ok(results.length === 1)
      assert.equal(results[0].organizationId, organizationId)
      assert.equal(results[0].referendumId, referendumId)
    })
    it('the name of the referendum must be present', function() {
      assert.equal(results[0].name, name)
    })
    it('the proposal of the referendum must be present', function() {
      assert.equal(results[0].proposal, proposal)
    })
    it("must have the right number of options", function() {
      assert.equal(results[0].results.length, 2)
    })
    it('must have the first option', function() {
      assert.equal(results[0].results[0].name, "Carl")
      assert.equal(results[0].results[0].votes, 0)
    })
    it('must have the second option', function() {
      assert.equal(results[0].results[1].name, "Myra")
      assert.equal(results[0].results[1].votes, 0)
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
    let results = [];
    setUpReadModelTests({
      readModels: {results: referendumResultsReadmodel},
      events: [referendumCreated, voteCast ],
      resultsSetter: result => results = result
    });

    it('when a vote is cast for option A then the vote count for A goes up by 1.', function() {
      assert.equal(results[0].results[0].votes, 1)
    })
  })
})
