/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
 * ------------------------------------------------------------------------
 */

import { Mongo } from "../imports/mongo.ts";



export interface ApgEdr_MongoDb_CollectionPair<T extends Mongo.Document> {
  atlas?: Mongo.Collection<T>;
  local?: Mongo.Collection<T>;
}
