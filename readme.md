### This is example for [Neo4jreactivity](https://github.com/VeliovGroup/ostrio-Neo4jreactivity)

From this repository you will find out how to use Neo4j and Meteor within [Neo4jreactivity](https://github.com/VeliovGroup/ostrio-Neo4jreactivity) atmospherejs.com package

## Issues
Currently we met some weird issues within downloaded, not cloned, version of repository, when meteor installs older versions of packages on first `meteor` command run. If you met any issues like `method "..." not found` or `"..." package removed`, just run (inside `Meteor-Leaderboard-Neo4j` folder):
```bash
meteor remove ostrio:neo4jreactivity
meteor add ostrio:neo4jreactivity
```

### Install
#### Neo4j
Pick up Neo4j version from [Official Neo4j Website](http://neo4j.com/download/)
After download - unzip and place into root folder of your user (name it neo4j), then in Terminal run:
```bash
cd ~/neo4j #downloaded and replaced folder
bin/neo4j start
```

#### Node.js
Pick up version for your system on [Official Node.js Website](http://nodejs.org/download/)
Follow installer instructions

#### Meteor
Run this in Terminal:
```bash
curl https://install.meteor.com/ | sh
```

#### Neo4j NPM Package
To install Neo4j NPM Package, run this in Terminal:
```bash
npm -g install neo4j
```

#### Clone this repository
Run in Terminal:
```bash
git clone git@github.com:VeliovGroup/Meteor-Leaderboard-Neo4j.git
cd Meteor-Leaderboard-Neo4j
```

#### Running meteor
Run a line below in Terminal, inside ```Meteor-Leaderboard-Neo4j``` folder:
```bash
meteor
```

In your browser go to [localhost:3000](http://localhost:3000/)
To see Neo4j browser, go to [localhost:7474](http://localhost:7474/)