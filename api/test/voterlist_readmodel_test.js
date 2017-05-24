/* eslint-env mocha */
import setUpReadModelTests from './infra/setUpReadModelTests';
import * as voterListReadmodel from '../src/readModels/voterlist.js';
import PostalAddress from '../src/domain/PostalAddress';
import VoterRegistered from '../src/events/VoterRegistered';
import assert from 'assert';

describe('voterlist', function() {
  describe('Given that a voter registered', function() {
    let voterId = "voter-1";
    let organizationId = "org-1";
    let firstname = "Jim";
    let lastname = "Lastname";
    let address = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "94043", "addressCountry")
    let voterRegistered = new VoterRegistered(voterId, organizationId, firstname, lastname, address)
    let voterList = [];
    setUpReadModelTests({
      readModels: {voterList: voterListReadmodel},
      events: [voterRegistered ],
      resultsSetter: result => voterList = result
    });

    it('the voter should be in the voter list', function() {
      console.log(voterList[0])
      assert.ok(voterList.length === 1)
      assert.equal(voterList[0].voterId, voterId)
      assert.equal(voterList[0].organizationId, organizationId)
    })
  })
  describe('Given that a voter is already in the voter list', function() {
    let voterId = "voter-1";
    let organizationId = "org-1";
    let firstname = "Jim";
    let lastname = "Lastname";
    let address = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "94043", "addressCountry")
    let voterRegistered = new VoterRegistered(voterId, organizationId, firstname, lastname, address)
    let voterList = [];
    setUpReadModelTests({
      readModels: {voterList: voterListReadmodel},
      events: [voterRegistered ],
      resultsSetter: result => voterList = result
    })


    it('the voter should be in the voter list only once when VoterRegistered is received a second time', function() {
      assert.ok(voterList.length === 1)
      assert.equal(voterList[0].voterId, voterId)
    })
  })
})
