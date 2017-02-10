/* eslint-env mocha */
 import Referendum from '../src/domain/Referendum';
 import errors from '../src/domain/Errors';
 import CreateReferendum from '../src/commands/CreateReferendum';
 import ReferendumCreated from '../src/events/ReferendumCreated';
 import assert from 'assert';

describe('referendums', function() {
  describe('Given a Referendum doesn\'t exist yet, when CreateReferendum is called', function() {
     var referendum = new Referendum();
     var options = ["Remain a member of European Union", "Leave the European Union"];
     var result = referendum.execute(new CreateReferendum("134","Referendum on the United Kindom's membership of the European Union", "Should the United Kindom remain a member of the European Union?", options));
    it('it should publish a ReferendumCreated event', function() {
      assert.ok(result[0] instanceof ReferendumCreated);
      assert.ok(result.length == 1)
    }),
    it('it should have the referendum id', function() {
      assert.equal(result[0].referendumId, "134");
    });
    it('it should have the referendum name', function() {
      assert.equal(result[0].name, "Referendum on the United Kindom's membership of the European Union");
    });  
    it('it should have the referendum proposal', function() {
      assert.equal(result[0].proposal, "Should the United Kindom remain a member of the European Union?");
    });  
    it('it should have two options initially', function() {
      assert.equal(result[0].options.length, 3);
    });    
    it('it should have a first option', function() {
      assert.equal(result[0].options[0], "Remain a member of European Union");
    });   
    it('it should have a second option', function() {
      assert.equal(result[0].options[1], "Leave the European Union");
    });
    it('Third option has to be "None Of the above', function() {
      assert.equal(result[0].options[2], "None of the above");
    });
  })
  describe('Given an existing referendum, when CreateReferendum is called', function() {
     var referendum = new Referendum();
     var options = ["Remain a member of European Union", "Leave the European Union"];
     referendum.hydrate(
       new ReferendumCreated(
         referendum.execute(
           new CreateReferendum("134",
           "Referendum on the United Kindom's membership of the European Union", 
           "Should the United Kindom remain a member of the European Union?", 
           options
           )
        )
      )
    );
     it('should return an "already exists" error', function() {
        assert.throws(
          () => {
            referendum.execute(new CreateReferendum("134",
            "Referendum on the United Kindom's membership of the European Union", 
            "Should the United Kindom remain a member of the European Union?", options));
          },
          function(err) {
            if (err.name == "ValidationFailed" && err.message.find(m => m.msg === "Referendum already exists.") ) {
              return true;
            }
          },
          'unexpected error'
        );
     })
  });
describe('Given CreateReferendum is called with a blank name or proposal', function() {
    it('the change should be rejected.', function() {
      assert.throws(
        () => {
           var options = ["Remain a member of European Union", "Leave the European Union"];
           var referendum = new Referendum();
           referendum.execute(new CreateReferendum("134",
            null, 
            "", options));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Referendum name is a required field.") 
            && err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Referendum proposal is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  
  describe('When CreateReferendum is called with a blank referendum id', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var options = ["Remain a member of European Union", "Leave the European Union"];
           var referendum = new Referendum();
           referendum.execute(new CreateReferendum("",
            "Referendum on the United Kindom's membership of the European Union", 
            "Should the United Kindom remain a member of the European Union?", options));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Referendum id is a required field.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  describe('When CreateReferendum is called with no options', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var referendumId ="456";
           var referendum = new Referendum();
           referendum.execute(new CreateReferendum(referendumId, "Referendum on the United Kindom's membership of the European Union", 
            "Should the United Kindom remain a member of the European Union?", null));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "Referendum options are required.")){
            return true;
          }
        },
        'unexpected error'
      );
    });
  });
  describe('When CreateReferendum is called with empty list of options', function() {
    it('then the change should be rejected.', function() {
      assert.throws(
        () => {
           var referendumId ="456";
           var options = []
           var referendum = new Referendum();
           referendum.execute(new CreateReferendum(referendumId, "Referendum on the United Kindom's membership of the European Union", 
            "Should the United Kindom remain a member of the European Union?", options));
        },
        function(err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "At least two options are required.")){
            return true;
          }
        },
        'unexpected error'
      );
    });    
})})


