import { Mongo } from "../imports/mongo.ts";



export interface ApgEdr_MongoDb_CollectionPair<T extends Mongo.Document> {
  atlas?: Mongo.Collection<T>;
  local?: Mongo.Collection<T>;
}
