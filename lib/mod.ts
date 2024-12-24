/** -----------------------------------------------------------------------
 * @module [ApgMng] 
 * @author [APG] ANGELI Paolo Giusto
 * @description Mongo Utilities
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
 * ------------------------------------------------------------------------
 */
export * from './interfaces/ApgMng_IUpdateResults.ts';

export * from './types/ApgMng_TInsertResults.ts';

export * from './classes/ApgMng_Collection.ts';
export * from './classes/ApgMng_DB.ts';
export * from './classes/ApgMng_DB_Atlas.ts';
export * from './classes/ApgMng_DB_Local.ts';

export * from './enums/ApgMng_eMode.ts';
export * from './enums/ApgMng_Env_eEntry.ts';

export * from "./imports/mongo.ts";

export * from "./services/ApgMng_Service.ts";

