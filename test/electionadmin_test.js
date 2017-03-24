/* eslint-env mocha */
 import ElectionAdmin from '../src/domain/ElectionAdmin';
 import errors from '../src/domain/Errors';
 import CreateElectionAdmin from '../src/commands/CreateElectionAdmin';
 import ElectionAdminCreated from '../src/events/ElectionAdminCreated';
 import PostalAddress from '../src/domain/PostalAddress';
 import assert from 'assert';

describe('electionadmins', function() {
  describe('Given a electionAdmin doesn\'t exist yet, when CreateElectionAdmin is called', function() {
     var electionAdmin = new ElectionAdmin();
     var address = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "94043", "addressCountry")
     var result = electionAdmin.execute(new CreateElectionAdmin("134","Joy", "Murchinson", address));
    it('it should publish a ElectionAdminCreated event', function() {
      assert.ok(result[0] instanceof ElectionAdminCreated);
      assert.ok(result.length == 1)
    }),
    it('it should have the electionAdmin id', function() {
      assert.equal(result[0].electionAdminId, "134");
    });
    it('it should have the electionAdmin first name', function() {
      assert.equal(result[0].firstname, "Joy");
    });  
    it('it should have the electionAdmin lastname', function() {
      assert.equal(result[0].lastname, "Murchinson");
    });  
    it('it should have a zip code in the address.', function() {
      assert.equal(result[0].address.postalCode, "94043");
    });    
    it('it should have a state in the address.', function() {
      assert.equal(result[0].address.addressRegion, "WA");
    });   
  }),
  describe('Given an existing electionAdmin, when CreateElectionAdmin is called', function() {
     var electionAdmin = new ElectionAdmin();
     electionAdmin.hydrate(new ElectionAdminCreated("123", "Joy", "Murchinson"));
     it('should return an "already exists" error', function() {
        assert.throws(
          () => {
            electionAdmin.execute(new CreateElectionAdmin("123","Joy", "Murchinson", "94043", "addressCountry"));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "ElectionAdmin already exists.") ) {
              return true;
            }
          },
          'unexpected error'
        );
     })
  });
  describe('Given CreateElectionAdmin is called with a blank lastname or firstname', function() {
    it('the change should be rejected.', function() {
      assert.throws(
        () => {
           var electionAdminId ="456";
           var electionAdminAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "addressRegion", "94043", "addressCountry")
           var electionAdmin = new ElectionAdmin();
           electionAdmin.execute(new CreateElectionAdmin(electionAdminId, null, "", electionAdminAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "ElectionAdmin lastname is a required field.") 
            && err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "ElectionAdmin firstname is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  
  describe('When CreateElectionAdmin is called with a blank electionAdmin id', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var electionAdminId ="";
           var electionAdminName = "Joy Murchinson";
           var electionAdminAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "addressRegion", "94043", "addressCountry")
           var electionAdmin = new ElectionAdmin();
           electionAdmin.execute(new CreateElectionAdmin(electionAdminId, electionAdminName, electionAdminName, electionAdminAddress));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "ElectionAdmin id is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  
  describe('When CreateElectionAdmin is called with a blank zip code in the address', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var electionAdminId ="456";
           var electionAdminAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", "WA", "", "addressCountry")
           var electionAdmin = new ElectionAdmin();
           electionAdmin.execute(new CreateElectionAdmin(electionAdminId, "Joy", "Murchinson", electionAdminAddress));
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
  describe('When CreateElectionAdmin is called with a blank state in the address', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var electionAdminId ="456";
           var electionAdminAddress = new PostalAddress("streetAddress", "postOfficeBoxNumber", "addressLocality", null, "95534", "addressCountry")
           var electionAdmin = new ElectionAdmin();
           electionAdmin.execute(new CreateElectionAdmin(electionAdminId, "Joy", "Murchinson", electionAdminAddress));
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
