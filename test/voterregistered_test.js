/* eslint-env mocha */
 // import Voter from '../src/domain/Voter';
 import errors from '../src/domain/Errors';
 import Voter from '../src/domain/Voter';
 import RegisterVoter from '../src/commands/RegisterVoter';
 import VoterRegistered from '../src/events/VoterRegistered';
 import PostalAddress from '../src/domain/PostalAddress';
 import assert from 'assert';

describe('voterregistrations', function() {
  describe('Given a voter isn\'t registered yet, when RegisterVoter is called', function() {
     var voter = new Voter();
     var address = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "94043", "addressCountry")
     var result = voter.execute(new RegisterVoter("987654321","Nupur", "Patel", address));
    it('it should publish a VoterRegistered event', function() {
      assert.ok(result[0] instanceof VoterRegistered);
      assert.ok(result.length == 1)
    }),
    it('it should have the voter id', function() {
      assert.equal(result[0].voterId, "987654321");
    });
    it('it should have the voter first name', function() {
      assert.equal(result[0].firstname, "Nupur");
    });
    it('it should have the voter lastname', function() {
      assert.equal(result[0].lastname, "Patel");
    });
    it('it should have a zip code in the address.', function() {
      assert.equal(result[0].address.postalCode, "94043");
    });
    it('it should have a state in the address.', function() {
      assert.equal(result[0].address.addressRegion, "WA");
    });
  }),
  describe('Given an existing voter, when RegisterVoter is called', function() {
     var voter = new Voter();
     voter.hydrate(new VoterRegistered("876543219", "Nupur", "Patel"));
     it('should return an "already exists" error', function() {
        assert.throws(
          () => {
            voter.execute(new RegisterVoter("876543219","Nupur", "Patel"));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Voter already exists.") ) {
              return true;
            }
          },
          'unexpected error'
        );
     })
  });
  describe('Given RegisterVoter is called with a blank lastname or firstname', function() {
    it('the change should be rejected.', function() {
      assert.throws(
        () => {
           var voterId ="456";
           var voterAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "addressRegion", "94043", "addressCountry")
           var voter = new Voter();
           voter.execute(new RegisterVoter(voterId, null, "", voterAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter lastname is a required field.")
            && err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter firstname is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });

  describe('When RegisterVoter is called with a blank voter id', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var voterId ="";
           var voterName = "Nupur Patel";
           var voterAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "addressRegion", "94043", "addressCountry")
           var voter = new Voter();
           voter.execute(new RegisterVoter(voterId, voterName, voterAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter id is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });

  describe('When RegisterVoter is called with a blank zip code in the address', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var voterId ="456";
           var voterAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "", "addressCountry")
           var voter = new Voter();
           voter.execute(new RegisterVoter(voterId, "Nupur", "Patel", voterAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Zip / Postal Code is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  describe('When RegisterVoter is called with a blank state in the address', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var voterId ="456";
           var voterAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", null, "95534", "addressCountry")
           var voter = new Voter();
           voter.execute(new RegisterVoter(voterId, "Nupur", "Patel", voterAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Address Region is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
})})
