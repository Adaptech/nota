/* eslint-env mocha */
import Referendum from '../src/domain/Referendum';
import ModifyReferendumProposal from '../src/commands/ModifyReferendumProposal';
import ReferendumProposalModified from '../src/events/ReferendumProposalModified';
import CreateReferendum from '../src/commands/CreateReferendum';
import assert from 'assert';

describe('Modifying referendums', function() {
  describe('Given a referendum that does not exist, when the command ModifyReferendumProposal is called', function() {
    it('should throw a error', function() {
      assert.throws(() => {
        //making a empty referendum (that is not persisted into db) to borrow the execute method.
        var referendum = new Referendum();
        referendum.execute(new ModifyReferendumProposal("134", "organization-1", "Changed proposal goes here "))

      },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum does not exist.") ) {
            return true;
          }
        },
      );
    });
  });
  describe('Given an existing referendum, when ModifyReferendumProposal is called', function() {
    var referendum = new Referendum();
    var options = ["Remain a member of European Union", "Leave the European Union"];
    referendum.hydrate(
        referendum.execute(
          new CreateReferendum("134", "organization-1", "Referendum Name",
          "Should the United Klingon remain a member of the European Union?",
          options
          )
     )[0]
   );
   //above is setup for hydrating a existing referendum, now execute ModifyReferendumProposal
    describe("when modified proposal is valid", function() {
      var result = referendum.execute(
        new ModifyReferendumProposal("134", "organization-1", "modified proposal goes here")
      );
      it('should publish a ReferendumProposalModified event', function() {
        assert.ok(result[0] instanceof ReferendumProposalModified);
        assert.ok(result.length == 1);
      })
      it('it should have the referendum id', function() {
        assert.equal(result[0].referendumId, "134");
      });
      it('it should have the organization id', function() {
        assert.equal(result[0].organizationId, "organization-1");
      });
      it('it should have the modified proposal', function() {
        assert.equal(result[0].proposal, "modified proposal goes here");
      });
    })
    describe("when modified proposal is not valid", function() {
      it("throws an error", function() {
        assert.throws(
          () => {
            var result = referendum.execute(
              new ModifyReferendumProposal("134", "organization-1", "")
            );
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "proposal is a required field") ) {
              return true
            }
          }
        );
      });
    });
  });
});
