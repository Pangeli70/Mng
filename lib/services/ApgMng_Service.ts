/** ---------------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] Angeli Paolo Giusto
 * @version 0.9.0 [APG 2024/07/01]
 * @version 0.9.8 [APG 2024/10/17] Extends ApgUts_Service
 * @version 1.0.0 [APG 2024/12/24] Moving to Deno 2
 * ----------------------------------------------------------------------------
 */

import { ApgMng_DB_Atlas } from "../classes/ApgMng_DB_Atlas.ts";
import { ApgMng_DB_Local } from "../classes/ApgMng_DB_Local.ts";
import { Uts } from "../deps.ts";
import { ApgMng_Env_eEntry } from "../enums/ApgMng_Env_eEntry.ts";
import { Mongo } from "../imports/mongo.ts";
import { ApgEdr_MongoDb_CollectionPair } from "../interfaces/ApgMng_ICollectionPair.ts";



/**
 * Service used to manage the MongoDb databases used for 
 *  - Local is used for development and testing purposes
 *  - Atlas is used for production
 * 
 * The service allows to manage collection pairs.
 * It is expected that proper environment variables are set
 * to be able to connect to Atlas or Local DB 
 */
export class ApgMng_Service extends Uts.ApgUts_Service {


    static override InitServiceName() {
        return ApgMng_Service.name;
    }


    static #inited = false;
    private static dbName = 'undefined';

    private static _doLocalDb = false;
    private static _localDb: ApgMng_DB_Local | null = null;

    private static _doAtlasDb = false;
    private static _atlasDb: ApgMng_DB_Atlas | null = null;



    static Setup(
        adbName: string,
        adoLocalDb: boolean,
        adoAtlasDb: boolean
    ) {
        this.dbName = adbName;

        // On deploy, we don't use local DB
        this._doLocalDb = Uts.ApgUts_Is.IsDeploy() ? false : adoLocalDb;

        this._doAtlasDb = adoAtlasDb;

    }



    static async InitOrPanic() {

        if (this.#inited) {
            return;
        }

        let r = new Uts.ApgUts_Result<void>();

        if (this._doLocalDb) {
            r = await this.#initLocalDb();
            Uts.ApgUts.PanicIf(!r.ok, `Impossibile to initialize the MongoDb Local database connection`)
        }

        if (this._doAtlasDb) {
            r = await this.#initAtlasDb();
            Uts.ApgUts.PanicIf(!r.ok, `Impossibile to initialize the MongoDb Atlas database connection`)
        }

        this.#inited = true;

    }



    static async #initLocalDb() {

        const e = this.LogBegin(this.#initLocalDb);

        this._localDb = new ApgMng_DB_Local(this.dbName);

        const r = await this._localDb.initializeConnection();

        this.LogEnd(e)
        return r;

    };



    static async #initAtlasDb() {

        const e = this.LogBegin(this.#initAtlasDb);
        let r = new Uts.ApgUts_Result<void>();

        const ATLAS_HOST = Deno.env.get(ApgMng_Env_eEntry.ATLAS_HOST);
        if (ATLAS_HOST == undefined) {
            const m = "No Mongo DB Atlas Host provided in environment variables";
            return this.Error(r, e.method, m);
        }

        const ATLAS_USER = Deno.env.get(ApgMng_Env_eEntry.ATLAS_USER);
        if (ATLAS_USER == undefined) {
            const m = "No Mongo DB Atlas User provided in environment variables";
            return this.Error(r, e.method, m);
        }

        const ATLAS_PWD = Deno.env.get(ApgMng_Env_eEntry.ATLAS_PWD);
        if (ATLAS_PWD == undefined) {
            const m = "No Mongo DB Atlas Password provided in environment variables";
            return this.Error(r, e.method, m);
        }

        this._atlasDb = new ApgMng_DB_Atlas(this.dbName, ATLAS_HOST, ATLAS_USER, ATLAS_PWD);

        r = await this._atlasDb.initializeConnection();

        this.LogEnd(e)
        return r;

    };



    static async getDbCollectionPair<T extends Mongo.Document>(
        acollectionName: string,
    ) {

        await this.InitOrPanic();
        const e = this.LogBegin(this.getDbCollectionPair, acollectionName);

        const r = new Uts.ApgUts_Result<ApgEdr_MongoDb_CollectionPair<T>>();


        const p: ApgEdr_MongoDb_CollectionPair<T> = {}


        if (this._doLocalDb && this._localDb) {

            const r1 = this._localDb.getCollection<T>(acollectionName);
            if (!r1.ok) {
                return this.Error(r, e.method, 'Error getting local collection', r1.messages)
            }
            p.local = r1.payload!;
        }

        if (this._doAtlasDb && this._atlasDb) {

            const r1 = this._atlasDb.getCollection<T>(acollectionName);
            if (!r1.ok) {
                return this.Error(r, e.method, 'Error getting Atlas collection', r1.messages)
            }
            p.atlas = r1.payload!;
        }

        if (r.ok) {
            r.setPayload(p)
        }

        this.LogEnd(e);
        return r;
    }


    
}

