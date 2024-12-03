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



export class ApgMng_DB_Atlas extends ApgMng_DB {



    /** Setup Connection to Mongo DB Atlas
     * 
     * @param amongoHost Store this on the Env Vars
     * @param auserName Store this on the Env Vars
     * @param auserPwd  Store this on the Env Vars
     * @param adbName Name of the database
     * 
     * @remarks Mongo Host MUST BE PRIMARY MASTER SHARD NODE!! 
     *   Verify Using Compass or Atlas web interface
     */
    constructor(
        adbName: string,
        amongoHost: string,
        auserName: string,
        auserPwd: string,
    ) {
        super(adbName);

        this.#setupAtlasConnection(amongoHost, auserName, auserPwd, adbName);

    }



    protected override initClassName() {
        return ApgMng_DB_Atlas.name
    }



    #setupAtlasConnection(
        amongoHost: string,
        auserName: string,
        auserPwd: string,
        adbName: string,
    ) {
        this.findOptions = { noCursorTimeout: false }
        this.connectOptions = {
            db: adbName,
            tls: true,
            servers: [{
                host: amongoHost,
                port: 27017
            }],
            credential: {
                username: auserName,
                password: auserPwd,
                db: adbName,
                mechanism: "SCRAM-SHA-1"
            }
        }
    }



    override async initializeConnection(): Promise<Uts.ApgUts_Result<void>> {

        const e = this.logBegin(this.initializeConnection);
        const r = new Uts.ApgUts_Result<void>();

        if (this.connectOptions == null) {
            return this.error(r, e.method, "Mongo DB Atlas connection options not provided");
        }

        if (this.client == null) {
            this.client = new Mongo.MongoClient();
        }

        const host = this.connectOptions!.servers[0].host;
        const hostFragments = host.split(".");

        let isConnectionEstablished = false;


        for (let i = 0; i < this.connectionAttempts; i++) {

            for (let i = 0; i < 3; i++) {

                const fragmentsCopy = [...hostFragments];
                fragmentsCopy[0] += "-shard-00-0" + i.toString();

                const shardHost = fragmentsCopy.join(".");
                this.connectOptions.servers[0].host = shardHost;

                try {

                    this.logInfo(e.method, `Trying connection using [${shardHost}] shard host`)
                    this.mongoDb = await this.client.connect(this.connectOptions!);
                    isConnectionEstablished = true;
                    this.logInfo(e.method, `Connection established using shard host [${shardHost}]`);
                    break;

                } catch (e) {

                    this.logInfo(e.method, `Connection error on shard host [${shardHost}]: ${e.message}`);
                    this.client.close();

                }

            }

            if (isConnectionEstablished) {
                break;
            }
            else {
                this.logInfo(e.method, `Connection attempt [${i}] failed on Atlas host. Retrying in [${this.connectionTimeoutMs}]ms ...`);
                await new Promise((resolve) => setTimeout(resolve, this.connectionTimeoutMs));
            }

        }

        if (!isConnectionEstablished) {
            return this.error(r, e.method, "Mongo DB Atlas connection not established");
        }

        // this.mongoDb = this.client.database(this.dbName);

        if (this.mongoDb == undefined || this.mongoDb == null) {
            return this.error(r, e.method, `MongoDB ${this.dbName} database name is invalid for current Atlas connection.`);
        }

        this.logEnd(e)
        return r;

    }

}

