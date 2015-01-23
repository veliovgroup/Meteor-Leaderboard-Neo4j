/* Allow client query execution */
Meteor.neo4j.allowClientQuery = true;
/* Custom URL to Neo4j should be here */
Meteor.neo4j.connectionURL = null;
/* But deny all writing actions on client */
if(Meteor.isClient){
    Meteor.neo4j.set.deny(Meteor.neo4j.rules.write);
}