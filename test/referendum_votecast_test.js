import Referendum from '../src/domain/Referendum';
import ReferendumCreated from '../src/events/ReferendumCreated';
import VoteCast from "../src/events/VoteCast";
import CastVote from "../src/commands/CastVote"
import assert from 'assert';

describe('VoteCast', function() {
  describe('Given an existing Referendum', function () {
    var referendum = new Referendum();
    var options = {"Remain a member of European Union": 0, "Leave the European Union": 0};
    let referendumId = "134"
    let voterId = "v-456"
    let vote = "Remain a member of European Union";

    referendum.hydrate(new ReferendumCreated("134", "Referendum on the United Kindom's membership of the European Union", "Should the United Kindom remain a member of the European Union?", options));

    describe('When CastVote is called', function () {
      let result = referendum.execute(new CastVote(referendumId, voterId, vote));

      it('Should publish a VoteCast event', function () {
        assert.ok(result[0] instanceof VoteCast)
      })
      it('it should have the referendum id', function () {
        assert.equal(result[0].referendumId, referendumId);
      });
      it('it should have the voterId', function () {
        assert.equal(result[0].voterId, voterId);
      });
      it('it should have the vote', function () {
        assert.equal(result[0].vote, vote);
      });

    })


    describe('When CastVote is called with a missing referendumId', function () {

      referendum.hydrate(new ReferendumCreated(referendumId, "Referendum on the United Kindom's membership of the European Union", "Should the United Kindom remain a member of the European Union?", options));

      it('The change should be rejected', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote("", voterId, vote));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Referendum id is a required field.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })

    describe('When CastVote is called with a missing voterId', function () {
      it('The change should be rejected', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, "", vote));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter id is a required field.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })
    describe('When CastVote is called with a missing vote', function () {
      it('The change should be rejected', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, voterId, ""));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Vote is a required field.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })

    describe('When CastVote is called with a vote that isn\'t an option', function () {

      it('The change should be rejected', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, voterId, "Cats are the best"));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Option does not exist.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })

    describe('When CastVote is called a second time for the same voter', function () {

      referendum.hydrate(new VoteCast(referendumId, voterId, vote))

      it('The change should be rejected', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, voterId, vote));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Already voted on this referendum.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })
  })
});