/* eslint-env mocha */
import Referendum from '../src/domain/Referendum';
import ReferendumCreated from '../src/events/ReferendumCreated';
import PollsOpened from '../src/events/PollsOpened';
import PollsClosed from '../src/events/PollsClosed';
import ClosePolls from "../src/commands/ClosePolls"
import assert from 'assert';

describe('Holding Referendums: Closing the polls', function() {
  describe('Given a referendum where polls are open', function () {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"

    referendum.hydrate(new ReferendumCreated(referendumId, "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    referendum.hydrate(new PollsOpened(referendumId));
    describe('When closing the polls', function () {
      let result = referendum.execute(new ClosePolls(referendumId));
      it('then polls should be closed.', function () {
        assert.ok(result[0] instanceof PollsClosed)
      })
      it('it should have the referendum id', function () {
        assert.equal(result[0].referendumId, referendumId);
      });
    })

    describe('When trying to close polls without saying for which referendum', function () {
      it('then this should fail.', function () {
        assert.throws(
          () => {
            referendum.execute(new ClosePolls(null));
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
  })

  describe('Given an Referendum and that polls are not open', function () {
    let referendum = new Referendum();
    var options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"

    referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));

    describe('When trying to close the polls', function () {
      it('then this should fail', function () {
        assert.throws(
          () => {
            referendum.execute(new ClosePolls(referendumId));
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
  })

  describe('Given a referendum doesn\'t exist', function () {
    describe('When trying to close polls', function () {
      it('then this should fail', function () {
        assert.throws(
          () => {
            new Referendum().execute(new ClosePolls("asdfsadf"));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum does not exist.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })
  })
});
