/*jshint strict:false */
/*global neo4j:false */
/*global N4JDB:false */
/*global Players:false */
/*global Meteor:false */
/*global Template:false */
/*global _:false */
/*global Session:false */
/*global Tracker:false */
/*global Random:false */


Players = neo4j.query('MATCH (a:Player) RETURN a ORDER BY a.score DESC');

if (Meteor.isClient) {
  Session.setDefault('players', []);

  Tracker.autorun(function(){
    if(Players.get()){
      Session.set('players', Players.get().a);
    }
  });

  Template.leaderboard.helpers({
    players: function () {
      return Session.get('players');
    },
    selectedName: function () {
      return Session.get('selectedName');
    },
    selectedPlayer: function(){
      return Session.get('selectedPlayer');
    }
  });

  Template.leaderboard.events({
    'click .inc': function () {
      neo4j.call('incrementScore', {playerId: Session.get('selectedPlayer'), incrementBy: 5});
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals('selectedPlayer', this._id) ? 'selected' : '';
    }
  });

  Template.player.events({
    'click': function () {
      Session.set('selectedPlayer', this._id);
      Session.set('selectedName', this.name);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {

  Meteor.startup(function () {

    if (!Players || Players && Players.a.length === 0) {
      
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

        N4JDB.query('CREATE (a:Player {_id: {_id}, name: {userName}, score: {userScore}})', 
          {
            _id: String.generate(),
            userName: name, 
            userScore: Math.floor(Random.fraction() * 10) * 5
          }
        , function(err){
          if(err){
            throw err;
          }
        });
      });
    }
  });

  neo4j.methods({
    'incrementScore': function(){
      return 'MATCH (a:Player {_id:{playerId}}) SET a.score = a.score + toInt({incrementBy})';
    }
  });
}
