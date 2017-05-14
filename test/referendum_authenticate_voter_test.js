/* eslint-env mocha */
 import Referendum from '../src/domain/Referendum';
 import AuthenticateVoter from '../src/commands/AuthenticateVoter';
 import ReferendumCreated from '../src/events/ReferendumCreated';
 import assert from 'assert';

describe('referendum - authenticate voter', function() {
  describe('Given a referendum', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134";
    let organizationId = "org-1";
    let voterId = "voter-1";
    let voterList = [];
    referendum.hydrate(new ReferendumCreated(referendumId, organizationId, "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    describe('when a voter who isn\'t on the voter list tries to authenticate', function() {
      it.only('then the voter should not be authenticated', function() {
        assert.throws(
          () => {
            referendum.execute(new AuthenticateVoter(referendumId, organizationId, voterId, voterList));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Voter is not on voter list") ) {
              return true;
            }
          },
          'unexpected error'
        )
      })
    }
    )
    describe('when the referendum id is missing', function() {
      it.only('then authenticating the voter won\'t work', function() {
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
      it.only('then authenticating the voter won\'t work', function() {
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
      it.only('then authenticating the voter won\'t work', function() {
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
