/** ---------------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] Angeli Paolo Giusto
 * @version 0.9.0 [APG 2024/07/13]
 * @version 0.9.1 [APG 2024/07/26] English comments
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
 * ----------------------------------------------------------------------------
 */


/**
 * Environment variables names used by Mng service
 */
export enum ApgMng_Env_eEntry {


    /**
     * Mongo DB atlas host
     */
    ATLAS_HOST = "APG_MNG_ATLAS_HOST",

    /**
     * Mongo DB atlas user
     */
    ATLAS_USER = "APG_MNG_ATLAS_USER",

    /**
     * Mongo DB atlas password
     */
    ATLAS_PWD = "APG_MNG_ATLAS_PWD"
    
}