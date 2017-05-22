/* eslint-env mocha */
 import Referendum from '../src/domain/Referendum';
 import DeleteReferendum from '../src/commands/DeleteReferendum';
 import ReferendumCreated from '../src/events/ReferendumCreated';
 import ReferendumDeleted from '../src/events/ReferendumDeleted';
 import PollsOpened from '../src/events/PollsOpened';
 import PollsClosed from '../src/events/PollsClosed';
 import assert from 'assert';

describe('Deleting referendums', function() {
  describe('Given a referendum, when deleting it', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"
    referendum.hydrate(new ReferendumCreated(referendumId, "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    var result = referendum.execute(new DeleteReferendum(referendumId));
    it('it should be deleted', function() {
      assert.ok(result[0] instanceof ReferendumDeleted);
      assert.ok(result.length == 1)
    }),
    it('it should have the referendum id', function() {
      assert.equal(result[0].referendumId, "134");
    });
  })

  describe('when deleting a referendum that doesn\'t exist', function() {
      it('the change should be rejected.', function() {
        let referendum = new Referendum();
        assert.throws(
          () => {
            referendum.execute(new DeleteReferendum("unknown"));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum doesn't exist.") ){
              return true;
            }
          },
          'unexpected error'
        );
      });
    });

  describe('when trying to delete a referendum without specifying which one', function() {
      it('the change should be rejected.', function() {
        let referendum = new Referendum();
        let options = ["Remain a member of European Union", "Leave the European Union"];
        let referendumId = "134"
        referendum.hydrate(new ReferendumCreated(referendumId, "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
        assert.throws(
          () => {
            referendum.execute(new DeleteReferendum(null));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum id is a required field.") ){
              return true;
            }
          },
          'unexpected error'
        );
      });
    });

  describe('When trying to delete a referendum where polls are open', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"
    referendum.hydrate(new ReferendumCreated(referendumId, "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    referendum.hydrate(new PollsOpened(referendum));
    it("should not be allowed", function() {
      assert.throws(
        () => {
          referendum.execute(new DeleteReferendum(referendumId));          },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Can't delete. Polls are open.") ){
            return true;
          }
        },
        'unexpected error'
      )
    })
   })

  describe('When trying to delete a completed referendum', function() {
    let referendum = new Referendum();
    let options = ["Remain a member of European Union", "Leave the European Union"];
    let referendumId = "134"
    referendum.hydrate(new ReferendumCreated(referendumId, "org-1", "Referendum on the United Klingon's membership of the European Union", "Should the United Klingon remain a member of the European Union?", options));
    referendum.hydrate(new PollsOpened(referendum));
    referendum.hydrate(new PollsClosed(referendum));
    it("this should not be allowed", function() {
      assert.throws(
        () => {
          referendum.execute(new DeleteReferendum(referendumId));          },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Polls are closed. Can't delete a completed referendum.") ){
            return true;
          }
        },
        'unexpected error'
      )
    })
   })    
})
