/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.5 [APG 2023/02/14] Rst simplification
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
 * ------------------------------------------------------------------------
 */

import { Mongo, Uts } from "../deps.ts";


export abstract class ApgMng_DB extends Uts.ApgUts_Class {

    protected connectionAttempts = 10;

    protected connectionTimeoutMs = 500;

    protected connectOptions: Mongo.ConnectOptions | null = null;

    protected client: Mongo.MongoClient | null = null;

    protected dbName: string;

    /** Special find options settings for queries timeout if we are using Atlas */
    protected findOptions: Mongo.FindOptions = {};

    protected mongoDb: Mongo.Database | null = null;



    get FindOptions() {
        return this.findOptions;
    }

    get Status() {
        return this.client !== null && this.mongoDb !== null;
    }

    get DbName() {
        return this.dbName;
    }

    get Database() {
        return this.mongoDb;
    }

    get Client() {
        return this.client;
    }



    constructor(
        adbName: string
    ) {
        super();
        this.dbName = adbName;
    }



    /** (Virtual abstract method)
     * 
     */
    initializeConnection() {
        return new Promise<Uts.ApgUts_Result<void>>(() => {
            Uts.ApgUts.CalledVirtualAbstractSoExit(this.NAME, this.initializeConnection.name)
        })
    }



    closeConnection() {
        if (this.client != null) {
            this.client.close();
            this.client = null;
        }
    }



    getCollection<T extends Mongo.Document>(
        acollectionName: string
    ): Uts.ApgUts_Result<Mongo.Collection<T>> {

        const e = this.logBegin(this.getCollection);
        const r = new Uts.ApgUts_Result<Mongo.Collection<T>>();

        if (!this.mongoDb) {
            return this.error(r, e.method, "Mongo database in not initialized");
        };

        const p = this.mongoDb.collection<T>(acollectionName);

        if (!p) {
            const m = `The [${acollectionName}] collection is not available nitialized in the database`;
            return this.error(r, e.method, m);
        }

        this.logInfo(e.method, `Collection [${acollectionName}] is available in the database`);
        r.setPayload(p);

        this.logEnd(e);
        return r;
    }

}

