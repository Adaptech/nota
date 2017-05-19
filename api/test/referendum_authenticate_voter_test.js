/* eslint-env mocha */
 import Referendum from '../src/domain/Referendum';
 import AuthenticateVoter from '../src/commands/AuthenticateVoter';
 import ReferendumCreated from '../src/events/ReferendumCreated';
 import VoterAuthenticated from '../src/events/VoterAuthenticated';
 import assert from 'assert';

describe('referendum - authenticate voter', function() {
  describe('Given a referendum Jim wants to vote in', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134";
    let organizationId = "org-1";
    referendum.hydrate(new ReferendumCreated(referendumId, organizationId, "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    describe('and that Jim is on the voter list, when he tries to authenticate', function() {
      let voterListWithJimInIt = [  {
            "voterId": "Jim",
            "organizationId": "org-1",
            "firstname": "Jim",
            "lastname": "Miller",
            "address": {
              "streetAddress": "405 E. Main",
              "postOfficeBoxNumber": null,
              "addressLocality": "Agassiz",
              "addressRegion": "WA",
              "postalCode": "98605",
              "addressCountry": "US"
            }
          }];
      let result = referendum.execute(new AuthenticateVoter(referendumId, organizationId, "Jim", voterListWithJimInIt));
      it('then he is authenticated.', function() {
        assert.ok(result[0] instanceof VoterAuthenticated);
        assert.ok(result.length == 1)
      })
    })
  })
})

describe('referendum - prevent voters from voting more than once', function() {
  describe('Given a referendum Jim wants to vote in', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134";
    let organizationId = "org-1";
    referendum.hydrate(new ReferendumCreated(referendumId, organizationId, "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    describe('and that Jim has already voted', function() {
      referendum.hydrate(new VoterAuthenticated(referendumId, organizationId, "Jim"));
      let voterListWithJimInIt = ["Jim"];
      it('when Jim tries to vote again then he isn\'t permitted to do so.', function(){
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter(referendumId, organizationId, "Jim", voterListWithJimInIt));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Voter has already voted") ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    })
  })
})

describe('referendum - authenticate voter who isn\'t on the voters list', function() {
  describe('Given a referendum Jim wants to vote in', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134";
    let organizationId = "org-1";
    let voterId = "Jim";
    describe('and that Jim isn\'t on the voter list, when he tries to authenticate', function() {
      let emptyVoterList = [];
      referendum.hydrate(new ReferendumCreated(referendumId, organizationId, "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
      it('then he should not be authenticated', function() {
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter(referendumId, organizationId, voterId, emptyVoterList));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Voter is not on voter list") ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    })
  })
})

describe('referendum - authenticate with missing API parameters', function() {
  describe('Given a referendum Jim wants to vote in', function() {
    let referendum = new Referendum();
    describe('when the referendum id is missing', function() {
      it('then authenticating the voter won\'t work', function() {
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter(null, "org-1", "voter-3", []));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum id is a required field.")
             ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    }
    )
    describe('when the organization id is missing', function() {
      it('then authenticating the voter won\'t work', function() {
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter("referendum-on-something", "", "voter-3", []));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Organization id is a required field.")
             ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    }
    )
    describe('when there is no voter', function() {
      it('then authenticating the voter won\'t work', function() {
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter("referendum-on-something", "organized-by-somebody", null, []));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Voter id is a required field.")
             ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    }
    )
  })
})
