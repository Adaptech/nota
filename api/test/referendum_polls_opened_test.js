/* eslint-env mocha */
import Referendum from '../src/domain/Referendum';
import ReferendumCreated from '../src/events/ReferendumCreated';
import PollsOpened from '../src/events/PollsOpened';
import OpenPolls from "../src/commands/OpenPolls"
import assert from 'assert';

describe('Holding Referendums: Opening the polls', function() {
  describe('Given an existing Referendum', function () {
    let referendum = new Referendum();
    var options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"

    referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));

    describe('When OpenPolls is called', function () {
      let result = referendum.execute(new OpenPolls(referendumId));

      it('then polls should be opened.', function () {
        assert.ok(result[0] instanceof PollsOpened)
      })
      it('it should have the referendum id', function () {
        assert.equal(result[0].referendumId, referendumId);
      });
    })

    describe('When trying to open polls without saying which referendum they are for', function () {
      it('then this should fail.', function () {
        assert.throws(
          () => {
            referendum.execute(new OpenPolls(null));
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

  describe('Given an Referendum and that polls are open already', function () {
    let referendum = new Referendum();
    var options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"

    referendum.hydrate(new ReferendumCreated("134", "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    referendum.hydrate(new PollsOpened("134"));

    describe('When OpenPolls is called', function () {
      it('then this should fail.', function () {
        assert.throws(
          () => {
            referendum.execute(new OpenPolls(referendumId));
          },
          function (err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Polls are already open.")) {
              return true;
            }
          },
          'unexpected error'
        );
      })
    })
  })

  describe('Given a referendum doesn\'t exist', function () {
    describe('When trying to open polls', function () {
      it('then this should fail', function () {
        assert.throws(
          () => {
            new Referendum().execute(new OpenPolls("134"));
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
