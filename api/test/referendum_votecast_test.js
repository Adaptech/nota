/* eslint-env mocha */
import Referendum from '../src/domain/Referendum';
import ReferendumCreated from '../src/events/ReferendumCreated';
import PollsOpened from '../src/events/PollsOpened';
import VoterAuthenticated from '../src/events/VoterAuthenticated';
import VoteCast from "../src/events/VoteCast";
import CastVote from "../src/commands/CastVote"
import assert from 'assert';

describe('Holding Referendums: Casting Votes', function() {
  describe('Given a referendum about European Union membership and that polls are open', function () {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"
    let vote = "Remain a member of European Union";

    referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    referendum.hydrate(new PollsOpened(referendumId));
    referendum.hydrate(new VoterAuthenticated(referendumId, "org-1", "voter-1"));

    describe("When voting to remain in the European Union", function () {
      let result = referendum.execute(new CastVote(referendumId, "voter-1", vote));

      it('then the vote should be recorded', function () {
        assert.ok(result[0] instanceof VoteCast)
      })
      it('and the vote should be about European Union Membership', function () {
        assert.equal(result[0].referendumId, referendumId);
      });
      it('and the option chosen should be to remain in the European Union', function () {
        assert.equal(result[0].vote, vote);
      });

    })

    describe("When trying to vote in a referendum that doesn't exist", function () {
      it('should not be possible', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote("", "123", vote));
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

    describe('When trying to cast a vote without selecting an option', function () {
      it('should not be possible', function () {
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, "123", ""));
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

    describe('When trying to cast a vote that isn\'t one of the options', function () {
      it('should not be possible', function () {
        let referendum = new Referendum();
        referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
        referendum.hydrate(new PollsOpened(referendumId));
        referendum.hydrate(new VoterAuthenticated(referendumId, "org-1", "voter-1"));
        assert.throws(
          () => {
            referendum.execute(new CastVote(referendumId, "voter-1", "Cats are the best"));
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
  })

  describe('When polls are not open', function () {
    var referendum = new Referendum();
    var options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"
    let vote = "Remain a member of European Union";

    referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    it('voting should not be possible', function () {
      assert.throws(
        () => {
          referendum.execute(new CastVote(referendumId, "123", vote));
        },
        function (err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Polls are not open.")) {
            return true;
          }
        },
        'unexpected error'
      );
    })
  })

  describe('When trying to cast a vote without being an authenticated voter', function () {
    it('should not be possible', function () {
      let referendum = new Referendum();
      let options = ["Remain a member of European Union", "Leave the European Union"];
      referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
      referendum.hydrate(new PollsOpened("referendum-1"));
      assert.throws(
        () => {
          referendum.execute(new CastVote("referendum-1", "voter-1", "Leave the European Union"));
        },
        function (err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter is not authenticated.")) {
            return true;
          }
        },
        'unexpected error'
      );
    })
  })

  describe('When trying to cast a vote without being an authenticated voter', function () {
    it('should not be possible', function () {
      let referendum = new Referendum();
      let options = ["Remain a member of European Union", "Leave the European Union"];
      referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
      referendum.hydrate(new PollsOpened("referendum-1"));
      assert.throws(
        () => {
          referendum.execute(new CastVote("referendum-1", "voter-1", "Leave the European Union"));
        },
        function (err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Voter is not authenticated.")) {
            return true;
          }
        },
        'unexpected error'
      );
    })
  })

});
