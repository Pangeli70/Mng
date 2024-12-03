/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 0.1 APG 20240921 Integration in Deno 2
 * ------------------------------------------------------------------------
 */

import {Mongo, Uts} from "../deps.ts";
import {ApgMng_DB} from "./ApgMng_DB.ts";



export class ApgMng_DB_Local extends ApgMng_DB {


    constructor(
        adbName: string
    ) {

        super(adbName);

        this.#setupLocalConnection(adbName);

    }



    protected override initClassName() {
        return ApgMng_DB_Local.name
    }



    #setupLocalConnection(
        adbName: string
    ) {

        this.connectOptions = {
            db: adbName,
            tls: false,
            servers: [{
                host: "127.0.0.1",
                port: 27017
            }],
        }

    }



    override async initializeConnection(): Promise<Uts.ApgUts_Result<void>> {

        const e = this.logBegin(this.initializeConnection);
        const r = new Uts.ApgUts_Result<void>();

        if (this.connectOptions == null) {
            return this.error(r, e.method, "Mongo DB Local connection options not provided");
        }

        if (this.client == null) {
            this.client = new Mongo.MongoClient();
        }

        let isConnectionEstablished = false;

        for (let i = 0; i < this.connectionAttempts; i++) {


            try {
                this.logInfo(e.method, `Trying connection using local host`)
                this.mongoDb = await this.client.connect(this.connectOptions!);
                isConnectionEstablished = true;
                this.logInfo(e.method, `Connection established to local host`);
                break;

            } catch (e) {

                this.logInfo(e.method, `Connection attempt [${i}] failed on local host: ${e.message}. Retrying in [${this.connectionTimeoutMs}]ms ...`);
                this.client.close();
                await new Promise((resolve) => setTimeout(resolve, this.connectionTimeoutMs));
            }

        }

        if (!isConnectionEstablished) {
            return this.error(r, e.method, "Mongo DB Local connection not established");
        }

        // this.mongoDb = this.client.database(this.dbName);

        if (this.mongoDb == undefined || this.mongoDb == null) {
            return this.error(r, e.method, `MongoDB ${this.dbName} database name is invalid for current Atlas connection.`);
        }

        this.logEnd(e)
        return r;


    }



}

