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
  Session.setDefault('searchString', ".");

  Tracker.autorun(function(){
    Players.subscribe('allPlayers', {search: Session.get('searchString')}, 'node');
  });

  Template.leaderboard.helpers({
    players: function () {
      return Players.find({
        'metadata.labels': 'Player',
        name: {
          '$regex': Session.get('searchString')+'*.',
          '$options': 'i'
        }
      }, {
        sort:{
          score: -1
        }
      });
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
      Players.update({
        _id: Session.get('selectedPlayer')
      },{
        '$inc': {
          score: 5
        }
      });
    },
    'keyup #search': function(e) {
      searchString = e.currentTarget.value;
      if(searchString.length > 0){
        Session.set('searchString', (searchString+'').replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"));
      }else{
        Session.set('searchString', ".");
      }
    }
  });

  Template.addPlayer.events({
    'click #addPlayer': function () {
      if($('#newPlayerName').val()){
        Players.insert({
          name: $('#newPlayerName').val(),
          score: 0,
          __labels: ':Player'
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
    'click #removePlayer': function (e) {
      $(e.target).parent().remove();
      Players.remove({_id: this._id});
      Session.set('selectedPlayer', false);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {

  Players.publish('allPlayers', function(){
    if(this.search){
      this.search = "(?i)(" + this.search + ").*";
      return "MATCH (node:Player) WHERE node.name =~ {search} RETURN node ORDER BY node.score DESC";
    }
  }, function(){
    /* onSubscribe callback */
    if (Players.find({}).count() <= 0) {
      var names = [ 
                    'Ada Lovelace', 
                    'Grace Hopper', 
                    'Marie Curie',
                    'Carl Friedrich Gauss', 
                    'Nikola Tesla', 
                    'Claude Shannon', 
                    'Ostr.io'
                  ];
      var players = [];

      for (i = 0, len = names.length; i < len; i++) {
        name = names[i];
        players.push({
          name: name, 
          score: Math.floor(Random.fraction() * 10) * 5,
          __labels: ':Player'
        });
      }

      Players.insert(players);

      // Meteor.neo4j.query('CREATE (a:Player {players})', {players: players}, function(err){
      //   if(err){
      //     throw err;
      //   }
      // });

      // Meteor.N4JDB.query('CREATE (a:Player {players})', {players: players}, function(err){
      //   if(err){
      //     throw err;
      //   }
      // });
    }
  });
}
