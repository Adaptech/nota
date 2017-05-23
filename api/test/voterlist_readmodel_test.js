/* eslint-env mocha */
 var voterListReadmodel = require('../src/readModels/voterlist.js');
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
    const eventData = {
        typeId: 'VoterRegistered',
        event: voterRegistered,
        metadata: null
    };
    let voterList = [];
    voterList = voterListReadmodel.handler(voterList, eventData);
    it('the voter should be in the voter list', function() {
      assert.ok(voterList.length === 1)
      assert.equal(voterList[0].voterId, voterId)
      assert.equal(voterList[0].organizationId, organizationId)
      assert.equal(voterList[0].firstname, firstname)
      assert.equal(voterList[0].lastname, lastname)
      assert.equal(voterList[0].address, address)
    })
  })
  describe('Given that a voter is already in the voter list', function() {
    let voterId = "voter-1";
    let organizationId = "org-1";
    let firstname = "Jim";
    let lastname = "Lastname";
    let address = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "94043", "addressCountry")
    let voterRegistered = new VoterRegistered(voterId, organizationId, firstname, lastname, address)
    const eventData = {
        typeId: 'VoterRegistered',
        event: voterRegistered,
        metadata: null
    };
    let voterList = [];
    voterList = voterListReadmodel.handler(voterList, eventData);
    it('the voter should be in the voter list only once when VoterRegistered is received a second time', function() {
      voterList = voterListReadmodel.handler(voterList, eventData);
      assert.ok(voterList.length === 1)
      assert.equal(voterList[0].voterId, voterId)
    })
  })
})
