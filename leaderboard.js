/*jshint strict:false */
/*global Meteor:false */
/*global Template:false */
/*global $:false */
/*global _:false */
/*global Session:false */
/*global Tracker:false */
/*global Random:false */

var Players = Meteor.neo4j.collection('players');

if (Meteor.isClient) {

  Tracker.autorun(function(){
    Meteor.neo4j.subscribe('players', null, 'a');
  });

  Template.leaderboard.helpers({
    players: function () {
      return Players.find({});
    },
    selectedName: function () {
      var player = Players.findOne({_id: Session.get('selectedPlayer')});
      if(player){
        return player.name;
      }
    },
    selectedPlayer: function(){
      return Session.get('selectedPlayer');
    }
  });

  Template.leaderboard.events({
    'click .inc': function () {
      Meteor.neo4j.call('incrementScore', {playerId: Session.get('selectedPlayer'), incrementBy: 5});
    }
  });

  Template.addPlayer.events({
    'click #addPlayer': function () {
      if($('#newPlayerName').val()){
        Meteor.neo4j.call('addPlayer', {
          userName: $('#newPlayerName').val(), 
          userId: String.generate()
        });
        $('#newPlayerName').val('');
      }
    }
  });

  Template.player.helpers({
    selected: function () {
      if(Session.equals('selectedPlayer', this._id)){
        return 'selected';
      }
    }
  });

  Template.player.events({
    'click': function () {
      Session.set('selectedPlayer', this._id);
    },
    'click #removePlayer': function (e, template) {
      $(e.target).parent().remove();
      Meteor.neo4j.call('removePlayer', {playerId: this._id});
      Session.set('selectedPlayer', false);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {

  // Meteor.neo4j.connectionURL = 'http://neo4j:1234@localhost:7474'

  Meteor.neo4j.publish('players', function(){
    return 'MATCH (a:Player) RETURN a ORDER BY a.score DESC';
  }, function(){
    /* onSubscribe callback */
    if (!Players.findOne({})) {
      var names = [ 
                    'Ada Lovelace', 
                    'Grace Hopper', 
                    'Marie Curie',
                    'Carl Friedrich Gauss', 
                    'Nikola Tesla', 
                    'Claude Shannon', 
                    'Ostr.io'
                  ];

      _.each(names, function (name) {

        Meteor.N4JDB.query('CREATE (a:Player {_id: {_id}, name: {userName}, score: {userScore}})', {

            _id: String.generate(),
            userName: name, 
            userScore: Math.floor(Random.fraction() * 10) * 5

          }, function(err){
            if(err){
              throw err;
            }
          }
        );
      });
    }
  });

  Meteor.neo4j.methods({
    'incrementScore': function(){
      return 'MATCH (a:Player {_id:{playerId}}) SET a.score = a.score + toInt({incrementBy})';
    },
    'addPlayer': function(){
      return 'CREATE (a:Player {_id:{userId}, name: {userName}, score: 0})';
    },
    'removePlayer': function(){
      return 'MATCH (a:Player {_id:{playerId}}) DELETE a';
    }
  });
}
