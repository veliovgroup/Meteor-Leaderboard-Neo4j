/* Allow client query execution */
neo4j.allowClientQuery = true;
/* Custom URL to Neo4j should be here */
neo4j.connectionURL = null;
/* But deny all writing actions on client */
if(Meteor.isClient){
    neo4j.set.deny(neo4j.rules.write);
}