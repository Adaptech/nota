/* eslint-env mocha */
 import Referendum from '../src/domain/Referendum';
 import errors from '../src/domain/Errors';
 import CreateReferendum from '../src/commands/CreateReferendum';
 import ReferendumCreated from '../src/events/ReferendumCreated';
 import VoteCast from "../src/events/VoteCast";
 import CastVote from "../src/commands/CastVote"
 import assert from 'assert';

describe('referendums', function() {
  describe('Given a Referendum doesn\'t exist yet, when CreateReferendum is called', function() {
     var referendum = new Referendum();
     var options = {"Remain a member of European Union": 0, "Leave the European Union": 0};
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
    it('it should have three options initially', function() {
      assert.equal(Object.keys(result[0].options).length, 3);
    });    
    it('it should have a first option', function() {
      assert.equal(result[0].options["Remain a member of European Union"], 0);
    });   
    it('it should have a second option', function() {
      assert.equal(result[0].options["Leave the European Union"], 0);
    });
    it('Third option has to be "None Of the above', function() {
      assert.equal(result[0].options["None of the above"], 0);
    });
  })
  describe('Given an existing referendum, when CreateReferendum is called', function() {
     var referendum = new Referendum();
     var options = {"Remain a member of European Union":0, "Leave the European Union":0};
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
           var options = {"Remain a member of European Union": 0, "Leave the European Union": 0};
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
          var options = {"Remain a member of European Union": 0, "Leave the European Union": 0};
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
  describe('When CreateReferendum is called with empty options object', function() {
    it('then the change should be rejected.', function () {
      assert.throws(
        () => {
          var referendumId = "456";
          var options = {}
          var referendum = new Referendum();
          referendum.execute(new CreateReferendum(referendumId, "Referendum on the United Kindom's membership of the European Union",
            "Should the United Kindom remain a member of the European Union?", options));
        },
        function (err) {
          if (err.name == "ValidationFailed" && err.message.find(m => m.field && m.msg === "At least two options are required.")) {
            return true;
          }
        },
        'unexpected error'
      );
    });
  })

    describe('Given an existing Referendum', function(){
      var referendum = new Referendum();
      var options = {"Remain a member of European Union": 0, "Leave the European Union": 0};
      let referendumId= "134"
      let voterId = "v-456"
      let vote = "Remain a member of European Union";

      referendum.hydrate(new ReferendumCreated("134","Referendum on the United Kindom's membership of the European Union", "Should the United Kindom remain a member of the European Union?", options));

      describe('When CastVote is called', function(){
       let result = referendum.execute(new CastVote(referendumId, voterId, vote));

        it('Should publish a VoteCast event', function(){
           assert.ok(result[0] instanceof VoteCast)
        })
        it('it should have the referendum id', function() {
          assert.equal(result[0].referendumId, referendumId);
        });
        it('it should have the voterId', function() {
          assert.equal(result[0].voterId, voterId);
        });
        it('it should have the vote', function() {
          assert.equal(result[0].vote, vote);
        });

      })


      describe('When CastVote is called with a missing referendumId', function(){

        referendum.hydrate(new ReferendumCreated(referendumId,"Referendum on the United Kindom's membership of the European Union", "Should the United Kindom remain a member of the European Union?", options));

        it('The change should be rejected', function(){
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

      describe('When CastVote is called with a missing voterId', function(){
        it('The change should be rejected', function(){
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
      describe('When CastVote is called with a missing vote', function(){
        it('The change should be rejected', function(){
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

      describe('When CastVote is called with a vote that isn\'t an option', function(){

        it('The change should be rejected', function(){
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

      describe('When CastVote is called a second time for the same voter', function(){

        referendum.hydrate(new VoteCast(referendumId, voterId, vote))

      it('The change should be rejected', function(){
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


  })


