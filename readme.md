### This is example for [Neo4jreactivity](https://github.com/VeliovGroup/ostrio-Neo4jreactivity)

From this repository you will find out how to use Neo4j and Meteor within [Neo4jreactivity](https://github.com/VeliovGroup/ostrio-Neo4jreactivity) atmospherejs.com package

### Install
###### Neo4j
Pick up Neo4j version from [Official Neo4j Website](http://neo4j.com/download/)
After download - unzip and place into root folder of your user (name it neo4j), then in Terminal run:
```bash
cd ~/neo4j #downloaded and replaced folder
bin/neo4j start
```
* Note: __Neo4j database should be running before Meteor__ *

###### Node.js
Pick up version for your system on [Official Node.js Website](http://nodejs.org/download/)
Follow installer instructions

###### Meteor
Run this in Terminal:
```bash
curl https://install.meteor.com/ | sh
```

###### Neo4j NPM Package
To install Neo4j NPM Package, run this in Terminal:
```bash
npm -g install neo4j
```

###### Clone this repository
Run in Terminal:
```bash
git clone git@github.com:VeliovGroup/Meteor-Leaderboard-Neo4j.git
cd Meteor-Leaderboard-Neo4j
```

###### Running meteor
Run a line below in Terminal, inside ```Meteor-Leaderboard-Neo4j``` folder:
```bash
meteor
```

###### What next
 - In your browser go to [localhost:3000](http://localhost:3000/)
 - To see Neo4j browser, go to [localhost:7474](http://localhost:7474/)


------


### How we rewrite Leaderboard example to be used with Neo4j
In article below you will understand the basics of `ostrio:neo4jreactivity` and `ostrio:neo4driver` packages. How to translate queries and other code from MongoDB to Neo4j. How to write basic query in Neo4j. How to use reactivity in Neo4j.

#### Meteor’s Leaderboard example app, driven by Neo4j database
We've decided to take very basic example application at Meteor - "Leaderboard" and move it from MongoDB to Neo4j.

##### Prepare dev stage:
###### Create example app 
First of all download Meteor and Neo4j onto your working machine, then run:
```shell
$ meteor create --example leaderboard
$ cd leaderboard
$ meteor
```

###### Run Neo4j DB
Run inside of Neo4j directory:
```shell
$ bin/neo4j start
```

###### Installing Neo4j Meteor’s drivers
```shell
$ meteor add ostrio:neo4jreactivity
```

-------

##### Writing the code
###### Understanding the “Leaderboard” sources

 - When server start, it is creates Players
 - In template’s helper `players` - all players ordered by score
 - In template’s helper `selectedName` - player name comes via `findOne` method
 - Incrementation of score implemented via `update` method

Let’s put our hands on it

###### Moving to Neo4j:
At first let’s create neo4j config file `lib/neo4j.js`:
```javascript
/* Allow client query execution */
Meteor.neo4j.allowClientQuery = true;
/* Custom URL to Neo4j should be here */
/* CHANGE THIS LINE IN ACCORDING TO YOUR NEO4J SETTINGS */
Meteor.neo4j.connectionURL = 'http://user:password@localhost:7474';
/* But deny all writing actions on client */
Meteor.neo4j.set.deny(neo4j.rules.write);
```

Let’s move to `leaderboard.js` file and change this line [*Isomorphic*]:
```javascript
/* Players = new Mongo.Collection("players"); */
var Players = Meteor.neo4j.collection('players');
```
This is isomorphic code, so we have all data we need inside `Players` variable on both - server and client sides.

First, we need to publish some data to client [*Client*]:
```javascript
Players.publish('allPlayers', function(){
  return 'MATCH (node:Player) RETURN node ORDER BY node.score DESC';
});
```

And check if we have users or not, if not - create new users [*Server*]:
```javascript
Players.publish('allPlayers', function(){
  return 'MATCH (node:Player) RETURN node ORDER BY node.score DESC';
}, function(){
  if (Players.find({}).count() <= 0) {
    var names = [ 'Ada Lovelace', 
                  'Grace Hopper', 
                  'Marie Curie',
                  'Carl Friedrich Gauss', 
                  'Nikola Tesla', 
                  'Claude Shannon'];
    var players = [];
    _.each(names, function (name) {
      players.push({
        name: name, 
        score: Math.floor(Random.fraction() * 10) * 5,
        __labels: ':Player' /* Assign Cypher label to all nodes */
      });
    });
    Players.insert(players);
});
```

To generate Players we can use several methods, all methods below is reactive and works almost in same way, the `players` variable is array of objects {*[Object]*}:
```javascript
Players.insert(players);
/* or */
Meteor.neo4j.query('CREATE (a:Player {players})', {players: players});
/* or */
Meteor.N4JDB.query('CREATE (a:Player {players})', {players: players});
```

To increment ‘score’, we will use standard `update` method as we use in mongo [*Client*]:
```javascript
Players.update({
  _id: Session.get('selectedPlayer')
},{
  '$inc': {
    score: 1
  }
});
```

To create new user - we only will add the `__label` property [*Client*]:
```javascript
Players.insert({
  name: $('#newPlayerName').val(),
  score: 0,
  __labels: ':Player'
});
```

To return Players list on client side, we will find all nodes with `Player` label and sort them [*Client*]:
```javascript
Template.leaderboard.helpers({
  players: function () {
    Players.find({'metadata.labels': 'Player'}, {
      sort:{
        score: -1
      }
    });
  },
  ...
});
```


