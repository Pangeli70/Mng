import {
    Mongo, Uts
} from "../deps.ts";
import {
    ApgMng_IUpdateManyResult,
    ApgMng_IUpdateOneResult
} from "../interfaces/ApgMng_IUpdateResults.ts";
import {
    ApgMng_TInsertResult,
    ApgMng_TMultipleInsertResult
} from "../types/ApgMng_TInsertResults.ts";




/**
 * Non throwing CRUD operations on a Mongo Collection
 */
export class ApgMng_Collection<T extends Mongo.Document> extends Uts.ApgUts_Class {



    // Special find options settings if we are using Atlas
    private _findOptions: Mongo.FindOptions = {};

    private _collection: Mongo.Collection<T>;
    get collection(): Mongo.Collection<T> { return this._collection; }


    constructor(acollection: Mongo.Collection<T>) {
        super();
        this._collection = acollection;
    }



    async createOne(
        aitem: Mongo.InsertDocument<T>,
    ) {
        const r = new Uts.ApgUts_Result<ApgMng_TInsertResult>();
        const METHOD = this.method(this.createOne);

        try {
            const p = await this._collection.insertOne(aitem);
            r.setPayload(p)
        }
        catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async createMany(
        aitems: Mongo.InsertDocument<T>[],
    ) {
        const r = new Uts.ApgUts_Result<ApgMng_TMultipleInsertResult>();
        const METHOD = this.method(this.createMany);

        try {
            const p = await this._collection.insertMany(aitems);
            r.setPayload(p)
        }
        catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async searchById(
        aid: Mongo.ObjectId | string
    ) {

        const r = new Uts.ApgUts_Result<T>();
        const METHOD = this.method(this.searchById);

        const filter: Mongo.Filter<{ _id: Mongo.ObjectId | string }> = { _id: aid }


        try {
            const p = await this._collection.findOne(filter, this._findOptions);

            if (!p) {
                r.error(METHOD, `Item with id [${aid}] not found`);
            }
            else {
                r.setPayload(p)
            }
        }
        catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async searchOneByFilter(
        afilter: Mongo.Filter<T>,
    ) {
        const r = new Uts.ApgUts_Result<T>();
        const METHOD = this.method(this.searchOneByFilter);

        try {
            const p = await this._collection.findOne(afilter, this._findOptions);

            if (!p) {
                r.error(METHOD, `Item not found`);
            }
            else {
                r.setPayload(p)
            }
        }
        catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async searchByFilter(
        afilter: Mongo.Filter<T>,
    ) {
        const r = new Uts.ApgUts_Result<T[]>();
        const METHOD = this.method(this.searchByFilter);

        try {
            const p = await this._collection
                .find(afilter, this._findOptions)
                .toArray();

            if (!Array.isArray(p)) {
                r.error(METHOD, `Items not found`);
            }
            else {
                r.setPayload(p)
            }
        }
        catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async deleteById(
        aid: Mongo.ObjectId | string
    ) {
        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.deleteById);

        const filter: Mongo.Filter<{ _id: Mongo.ObjectId | string }> = { _id: aid }

        try {
            const p = await this._collection.deleteOne(filter);
            r.setPayload(p);
        } catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async deleteByFilter(
        afilter: Mongo.Filter<T>
    ) {
        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.deleteByFilter);

        try {
            const p = await this._collection.deleteMany(afilter);
            r.setPayload(p,);
        } catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async deleteAll() {
        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.deleteAll);

        try {
            const p = await this._collection.deleteMany({});
            r.setPayload(p)
        }
        catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async countWithSkipOption(
        askipNum: number
    ) {

        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.countWithSkipOption);

        try {
            const cursor = this._collection.aggregate([
                { $skip: askipNum },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 }
                    }
                }
            ]);
            const tr = <any>await cursor.toArray();

            const p = tr[0].total;
            r.setPayload(p)

        } catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async countByFilter(
        afilter: Mongo.Filter<T>
    ) {
        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.countByFilter);

        try {
            const p = await this._collection.countDocuments(afilter);
            r.setPayload(p);
        } catch (e) {
            r.error(METHOD, e.message);
        }

        return r;
    }



    async countAll() {
        const r = new Uts.ApgUts_Result<number>();
        const METHOD = this.method(this.countAll);

        try {
            const p = await this._collection.countDocuments();
            r.setPayload(p,)
        } catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async updateOne(
        afilter: Mongo.Filter<T>,
        anewVal: Partial<T>,
    ) {

        const r = new Uts.ApgUts_Result<ApgMng_IUpdateOneResult>();
        const METHOD = this.method(this.updateOne);

        const newVal = { $set: anewVal } as Mongo.UpdateFilter<T>

        try {

            const p = await this._collection.updateOne(afilter, newVal);
            r.setPayload(p)

        } catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    async updateMany(
        afilter: Mongo.Filter<T>,
        anewVal: Partial<T>,
    ) {
        const r = new Uts.ApgUts_Result<ApgMng_IUpdateManyResult>();
        const METHOD = this.method(this.updateMany);

        const newVal = { $set: anewVal } as Mongo.UpdateFilter<T>;

        try {
            const p = await this._collection.updateMany(afilter, newVal);
            r.setPayload(p)
        } catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }



    // TODO move away this from here @APG(2024-10-18)
    async getAllDescSortedByUserName(
    ) {
        const r = new Uts.ApgUts_Result<T[]>();
        const METHOD = this.method(this.getAllDescSortedByUserName);

        try {
            const cursor = this._collection.find({}, this._findOptions)
            const p = await cursor.toArray();
            p.sort((a, b) => {
                return (a.username < b.username) ? 1 : (a.username > b.username) ? -1 : 0;
            });

            r.setPayload(p)
        } catch (e) {
            r.error(METHOD, e.message);
        }
        return r;
    }

}
