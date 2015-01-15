/* Allow client query execution */
neo4j.allowClientQuery = true;
/* But deny all writing actions on client */
if(Meteor.isClient){
    neo4j.set.deny(neo4j.rules.write);
}