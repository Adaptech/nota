/* eslint-env mocha */
import Referendum from '../src/domain/Referendum';
import ModifyReferendumProposal from '../src/commands/ModifyReferendumProposal';
import ReferendumProposalModified from '../src/events/ReferendumProposalModified';
import assert from 'assert';

describe('Modifying referendums', function() {

  describe('Given a referendum that doesnt exist', function() {
  var referendum = new Referendum("134", "organization-1",
     "Referendum on the United Klingon\'s membership of the European Union",
     "Should the United Klingon remain a member of the European Union?");
  var options = ["Remain a member of European Union", "Leave the European Union"]
  })
  it('should throw a error', function() {
    assert.throws(() => {
      referendum.execute(new ModifyReferendumProposal("134", "organization-1",
         "Changed referendum goes here "
         ))
    },
    function(err) {
      return true
    })
  })
})
