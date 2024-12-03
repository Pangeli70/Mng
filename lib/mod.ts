/** -----------------------------------------------------------------------
 * @module [ApgMng] Mongo Utilities
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 0.1 APG 20240921 Integration in Deno 2
 * ------------------------------------------------------------------------
 */
export type {
    ApgMng_IUpdateManyResult, ApgMng_IUpdateOneResult} from './interfaces/ApgMng_IUpdateResults.ts';

export type {
    ApgMng_TInsertResult,
    ApgMng_TMultipleInsertResult} from './types/ApgMng_TInsertResults.ts';

export { ApgMng_Collection } from './classes/ApgMng_Collection.ts';
export { ApgMng_DB } from './classes/ApgMng_DB.ts';
export { ApgMng_DB_Atlas } from './classes/ApgMng_DB_Atlas.ts';
export { ApgMng_DB_Local } from './classes/ApgMng_DB_Local.ts';

export { ApgMng_eMode } from './enums/ApgMng_eMode.ts';
export { ApgMng_Env_eEntry } from './enums/ApgMng_Env_eEntry.ts';

export { Mongo } from "./imports/mongo.ts";

export { ApgMng_Service } from "./services/ApgMng_Service.ts";
