/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Sepaation of concerns lib/srv
 * @version 0.1 APG 20240921 Integration in Deno 2
 * -----------------------------------------------------------------------
 */

import { Mongo } from '../deps.ts';


export interface ApgMng_IUpdateOneResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedId?: Mongo.ObjectId;
}


export interface ApgMng_IUpdateManyResult {
    matchedCount: number;
    modifiedCount: number;
    upsertedCount: number;
    upsertedIds?: Mongo.ObjectId[];
}