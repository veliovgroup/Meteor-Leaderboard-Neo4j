/*jshint strict:false */
/*global Meteor:false */
/*global Template:false */
/*global $:false */
/*global _:false */
/*global Session:false */
/*global Random:false */

var Players = Meteor.neo4j.query('MATCH (a:Player) RETURN a, count(a), a.score ORDER BY a.score DESC');

if (Meteor.isClient) {

  Template.leaderboard.helpers({
    players: function () {
      return Players.get();
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
      Meteor.neo4j.call('incrementScore', {playerId: Session.get('selectedPlayer'), incrementBy: 5});
    },
    'click #removePlayer': function () {
      Meteor.neo4j.call('removePlayer', {playerId: Session.get('selectedPlayer')});
      Session.set('selectedPlayer', false);
      Session.set('selectedName', false);
    }
  });

  Template.addPlayer.events({
    'click #addPlayer': function () {
      if($('#newPlayerName').val()){
        Meteor.neo4j.call('addPlayer', {userName: $('#newPlayerName').val()});
        $('#newPlayerName').val('');
      }
    }
  });

  Template.player.helpers({
    selected: function () {
      _this = this;
      if(Session.equals('selectedPlayer', this._id) && _.indexOf(Players.get().a.map(function(player){ return player._id === _this._id }), true) !== -1){
        return 'selected';
      }else{
        Session.set('selectedPlayer', null);
        Session.set('selectedName', null);
        return '';
      }
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

  if (!Players.get() || Players.get().a && Players.get().a.length === 0) {
    
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

  Meteor.neo4j.methods({
    'incrementScore': function(){
      return 'MATCH (a:Player {_id:{playerId}}) SET a.score = a.score + toInt({incrementBy})';
    },
    'addPlayer': function(){
      return 'CREATE (a:Player {_id:"' + String.generate() + '", name: {userName}, score: 0})';
    },
    'removePlayer': function(){
      return 'MATCH (a:Player {_id:{playerId}}) DELETE a';
    },
    'allPlayers': function(){
      return 'MATCH (a:Player) RETURN a ORDER BY a.score DESC';
    }
  });
}
