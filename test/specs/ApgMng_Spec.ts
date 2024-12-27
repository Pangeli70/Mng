/** -----------------------------------------------------------------------
 * @module [ApgMng]
 * @author [APG] ANGELI Paolo Giusto
 * @version 0.9.2 [APG 2022/10/04] Github Beta
 * @version 0.9.7 [APG 2023/05/21] Separation of concerns lib/srv
 * @version 1.0.0 [APG 2024/09/21] Moving to Deno 2
 * -----------------------------------------------------------------------
 */

import { ApgMng_Collection_SpecUsers } from "../classes/ApgMng_Spec_Users.ts";
import { ApgMng_Spec_Data_Users } from "../data/ApgMng_Spec_Data_Users.ts";
import { Mng, Spc } from "../deps.ts";
import { ApgMng_Spec_IUser_Schema } from "../interfaces/ApgMng_Spec_Schema_IUser.ts";



const DB_NAME = "ApgTest";
const COLLECTION_NAME = "Users";


export class ApgMng_Spec extends Spc.ApgSpc_Base {

    protected override initClassName(): string {
        return ApgMng_Spec.name + "_" + this._dbMode
    }

    // Special find options settings if we are using Atlas
    private _findOptions: Mng.Mongo.FindOptions = {};

    private _dbMode: Mng.ApgMng_eMode;

    private _rawUsers: Mng.Mongo.Collection<ApgMng_Spec_IUser_Schema> | null = null;
    private _users: ApgMng_Collection_SpecUsers | null = null;

    private _singleInsertObjectId: Mng.ApgMng_TInsertResult;



    constructor(amode: Mng.ApgMng_eMode) {

        super();
        this._dbMode = amode;

        // WARNING the following specs must run all in sequence because
        // every spec alters the dataset so every specification's correctness 
        // might depend on the previouses.
        this.runFlags = {
            [this.S01a_DeleteAll.name]: Spc.ApgSpc_eRun.yes,

            [this.S02a_InsertOne.name]: Spc.ApgSpc_eRun.yes,
            [this.S02b_Count.name]: Spc.ApgSpc_eRun.yes,
            [this.S02c_InsertMany.name]: Spc.ApgSpc_eRun.yes,

            [this.S03a_FindOneByID.name]: Spc.ApgSpc_eRun.yes,
            [this.S03b_FindOneByFilter.name]: Spc.ApgSpc_eRun.yes,
            [this.S03c_FindAllDescSorted.name]: Spc.ApgSpc_eRun.yes,
            [this.S03d_FindAllAndSkipSome.name]: Spc.ApgSpc_eRun.yes,
            [this.S03e_FindAllAndLimitToFirstN.name]: Spc.ApgSpc_eRun.yes,

            [this.S04a_CountWithFilter.name]: Spc.ApgSpc_eRun.yes,
            [this.S04b_CountByAggregateWithSkipOption.name]: Spc.ApgSpc_eRun.yes,

            [this.S05a_UpdateSingle.name]: Spc.ApgSpc_eRun.yes,
            [this.S05b_UpdateMany.name]: Spc.ApgSpc_eRun.yes,

            [this.S06a_DeleteSingleById.name]: Spc.ApgSpc_eRun.yes,
            [this.S06b_DeleteManyByFilter.name]: Spc.ApgSpc_eRun.yes,
        }

        //this.specifier.Mode = Uts.eApgUtsLogMode.silent;
    }



    override async execute() {

        // Clear database
        await this.S01a_DeleteAll();
        // Pupulate
        await this.S02a_InsertOne();
        await this.S02b_Count();
        await this.S02c_InsertMany();
        // Search
        await this.S03a_FindOneByID();
        await this.S03b_FindOneByFilter();
        await this.S03c_FindAllDescSorted();
        await this.S03d_FindAllAndSkipSome();
        await this.S03e_FindAllAndLimitToFirstN();
        // Aggregate
        await this.S04a_CountWithFilter();
        await this.S04b_CountByAggregateWithSkipOption();
        // Update
        await this.S05a_UpdateSingle();
        await this.S05b_UpdateMany();
        // Delete specific
        await this.S06a_DeleteSingleById();
        await this.S06b_DeleteManyByFilter();
    }



    override async mockInit() {

        const r = await super.mockInit();

        Mng.ApgMng_Service.Setup(DB_NAME, true, true)

        await Mng.ApgMng_Service.InitOrPanic();

        const r1 = await Mng.ApgMng_Service.getDbCollectionPairOrPanic<ApgMng_Spec_IUser_Schema>(COLLECTION_NAME)

        if (!r1.ok) {
            r.error(this.mockInit.name, `Impossibile to connect to [${DB_NAME}] database`, r1.messages)
        } else {

            this._rawUsers = (this._dbMode === Mng.ApgMng_eMode.local) ?
                r1.payload!.local!: 
                r1.payload!.atlas!

            if (!this._rawUsers) {
                r.error(this.mockInit.name, `[${COLLECTION_NAME}] collection not found`, r1.messages)
            }
            else {
                this._users = new ApgMng_Collection_SpecUsers(this._rawUsers);
            }
        }

        return r;
    }



    override async mockEnd() {

        let r = await super.mockEnd();

        return r;

    }



    async S01a_DeleteAll() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S01a_DeleteAll, this.runFlags);
        if (spec.DoSkip()) return;

        const r1 = await this._users.deleteAll();
        const n = r1.ok ? r1.payload! : 0;
        const r = n > 0;

        spec
            .When(`we want to delete all the users from the test collection`)
            .WeExpect(`to get more than one deletion`)
            .WeGot(`[${n}] deletions`, r)
            .Resume();

    }



    async S02a_InsertOne() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S02a_InsertOne, this.runFlags);
        if (spec.DoSkip()) return;

        const r1 = await this._users.createOne(ApgMng_Spec_Data_Users.single);
        const r = r1.ok;
        if (r) {
            this._singleInsertObjectId = r1.payload!;
        }

        spec
            .When(`we want to insert one user into the test collection`)
            .WeExpect(`to get a positive result`)
            .WeGot(`One insertion [${JSON.stringify(r1.payload)}]`, r)
            .Resume();
    }



    async S02b_Count() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S02b_Count, this.runFlags);
        if (spec.DoSkip()) return;

        const r1 = await this._users.countAll();
        const n = r1.ok ? r1.payload! : 0;
        const r = n === 1;

        spec
            .When(`we want to count items in the collection after a single insertion`)
            .WeExpect(`to get 1 as result`)
            .WeGot(`[${n}]`, r)
            .Resume();

    }



    async S02c_InsertMany() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S02c_InsertMany, this.runFlags);
        if (spec.DoSkip()) return;

        const r1 = await this._users.createMany(ApgMng_Spec_Data_Users.many);
        const n = r1.ok ? r1.payload!.insertedCount : 0;
        const r = n > 0;

        spec
            .When(`we want to insert many users into the test collection`)
            .WeExpect(`to get [${ApgMng_Spec_Data_Users.many.length}] insertions`)
            .WeGot(`[${n}] insertions`, r);

        const r2 = await this._users.countAll();
        const n2 = r1.ok ? r2.payload : 0;

        spec
            .WeExpect(`to get [${ApgMng_Spec_Data_Users.many.length + 1}] total items`)
            .WeGot(`[${n2}]`, r);

        spec.Resume();

    }



    async S03a_FindOneByID() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S03a_FindOneByID, this.runFlags);
        if (spec.DoSkip()) return;

        let r = this._singleInsertObjectId !== null;
        if (!r) {
            spec.Skip(
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        const r1 = await this._users.searchById(this._singleInsertObjectId!);
        const userName = r1.ok ? r1.payload?.username : "undefined";
        r = userName == ApgMng_Spec_Data_Users.single.username;

        spec
            .When(`we want to find one user into the test collection by object ID`)
            .WeExpect(`to get a the user with name [${ApgMng_Spec_Data_Users.single.username}]`)
            .WeGot(`the user with username [${userName}]`, r)
            .Resume();
    }



    async S03b_FindOneByFilter() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S03b_FindOneByFilter, this.runFlags);
        if (spec.DoSkip()) return;

        const USER_NAME = ApgMng_Spec_Data_Users.many[1].username;
        const PASSWORD = ApgMng_Spec_Data_Users.many[1].password;

        const r1 = await this._users.searchOneByFilter({ password: PASSWORD });
        const userName = r1.ok ? r1.payload?.username : "undefined";
        const r = userName == USER_NAME;

        spec
            .When(`we want to find one user with a specific password [${PASSWORD}]`)
            .WeExpect(`to get a the user with name [${USER_NAME}]`)
            .WeGot(`A user whose name is [${userName}]`, r)
            .Resume();
    }



    async S03c_FindAllDescSorted() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S03c_FindAllDescSorted, this.runFlags);
        if (spec.DoSkip()) return;

        const COUNT = ApgMng_Spec_Data_Users.many.length + 1;

        const r1 = await this._users.getAllDescSortedByUserName();
        const users = r1.ok ? r1.payload! : [];
        const n = users ? users.length : 0;
        let r = n == COUNT;

        spec
            .When(`we want retrieve all the users from the collection sorted in descending order`)
            .WeExpect(`to get [${COUNT}] items`)
            .WeGot(`[${n}] users`, r);

        const firstUserName = users![0].username;
        const secondUserName = users![1].username;
        r = firstUserName > secondUserName;

        spec
            .WeExpect(`that users[0] is greater than users[1]`)
            .WeGot(`[${firstUserName}] > [${secondUserName}]`, r);

        spec.Resume();

    }



    async S03d_FindAllAndSkipSome() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S03d_FindAllAndSkipSome, this.runFlags);
        if (spec.DoSkip()) return;

        const SKIP_NUM = 2;
        const TOTAL_NUM = ApgMng_Spec_Data_Users.many.length + 1;
        const RES_NUM = TOTAL_NUM - SKIP_NUM;

        const r1 = await this._users.collection
            .find(undefined, { noCursorTimeout: false })
            .skip(SKIP_NUM)
            .toArray();
        const n = r1.length;
        const r = n == RES_NUM;

        spec
            .When(`we want to find some users skipping the first [${SKIP_NUM}]`)
            .WeExpect(`to get an array of users with length [${RES_NUM}]`)
            .WeGot(`[${n}] items`, r)
            .Resume();
    }



    async S03e_FindAllAndLimitToFirstN() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S03e_FindAllAndLimitToFirstN, this.runFlags);
        if (spec.DoSkip()) return;

        const LIMIT_NUM = 3;

        const r1 = await this._users.collection
            .find(undefined, { noCursorTimeout: false })
            .limit(LIMIT_NUM)
            .toArray();
        const n = r1.length;
        const r = n == LIMIT_NUM;

        spec
            .When(`we want to find some users limiting the result to the first [${LIMIT_NUM}]`)
            .WeExpect(`to get an array of users with length [${LIMIT_NUM}]`)
            .WeGot(`[${n}] items`, r)
            .Resume();
    }



    async S04a_CountWithFilter() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S04a_CountWithFilter, this.runFlags);
        if (spec.DoSkip()) return;

        const GROUP_NAME = ApgMng_Spec_Data_Users.many[2].group;
        const EXPECT_NUM = 2;

        const r1 = await this._users.countByFilter({ group: GROUP_NAME });
        const n = (r1.ok) ? r1.payload : 0;
        const r = n == EXPECT_NUM

        spec
            .When(`we want to count all the items in the collection of the group [${GROUP_NAME}]`)
            .WeExpect(`to get [${EXPECT_NUM}] items`)
            .WeGot(`[${n}]`, r)
            .Resume();
    }



    async S04b_CountByAggregateWithSkipOption() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S04b_CountByAggregateWithSkipOption, this.runFlags);
        if (spec.DoSkip()) return;

        const SKIP_NUM = 3;
        const EXPECT_NUM = ApgMng_Spec_Data_Users.many.length + 1 - SKIP_NUM

        const r1 = await this._users.countWithSkipOption(SKIP_NUM);
        const n = (r1.ok) ? r1.payload : 0;
        const r = n == EXPECT_NUM

        spec
            .When(`we want count the items in the collection skipping [${SKIP_NUM}] of them`)
            .WeExpect(`to get [${EXPECT_NUM}]`)
            .WeGot(`[${n}]`, r)
            .Resume();

    }



    async S05a_UpdateSingle() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S05a_UpdateSingle, this.runFlags);
        if (spec.DoSkip()) return;

        const NEW_PWD = "newPassword";

        const r1 = await this._users.updateOne(
            { username: ApgMng_Spec_Data_Users.single.username },
            { password: NEW_PWD }
        );
        const n = r1.ok ? r1.payload!.modifiedCount : 0;
        const r = n == 1;

        spec
            .When(`we want to update the password of the user named ${ApgMng_Spec_Data_Users.single.username}`)
            .WeExpect(`to get the old [${ApgMng_Spec_Data_Users.single.password}] and the new value [${NEW_PWD}]`)
            .WeGot(`[${n}] items modified.`, r)
            .Resume();
    }



    async S05b_UpdateMany() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S05b_UpdateMany, this.runFlags);
        if (spec.DoSkip()) return;

        const NEW_GROUP = "newGroup";
        const OLD_GROUP = ApgMng_Spec_Data_Users.many[2].group;
        const UPDATED_NUM = 2;

        const r1 = await this._users.updateMany(
            { group: OLD_GROUP },
            { group: NEW_GROUP }
        )
        const n = r1.ok ? r1.payload!.modifiedCount : 0;
        const r = n == UPDATED_NUM;

        spec
            .When(`we want to update the group of the users in ${OLD_GROUP}`)
            .WeExpect(`to get [${UPDATED_NUM}] records updated with the new value [${NEW_GROUP}]`)
            .WeGot(`[${n}] items modified.`, r)
            .Resume();
    }



    async S06a_DeleteSingleById() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S06a_DeleteSingleById, this.runFlags);
        if (spec.DoSkip()) return;

        let r = this._singleInsertObjectId !== null;
        if (!r) {
            spec.Skip(
                `We need the result of ${this.S02a_InsertOne.name} to run this spec.`
            );
            return
        }

        const r1 = await this._users.deleteById(this._singleInsertObjectId!);
        const n = r1.ok ? r1.payload : 0;
        r = n == 1;

        spec
            .When(`we want to delete one user into the test collection by object ID`)
            .WeExpect(`to get the get [1] in the delete count result`)
            .WeGot(`[${n}] deletions`, r)
            .Resume();

    }


    async S06b_DeleteManyByFilter() {

        if (!this._users) return;
        const spec = Spc.ApgSpc_Service;
        spec.Init(this.S06b_DeleteManyByFilter, this.runFlags);
        if (spec.DoSkip()) return;

        const EXPECT_NUM = 2;
        const GROUP = ApgMng_Spec_Data_Users.many[2].group;
        const FILTER = { group: "group3" };

        const r1 = await this._users.countByFilter(FILTER);
        const n = r1.ok ? r1.payload : 0;
        const r = n == EXPECT_NUM;

        spec
            .When(`we want to delete the users that are in the group [${GROUP}]`)
            .WeExpect(`to get the get [${EXPECT_NUM}] in the delete count result`)
            .WeGot(`[${n}] deletions`, r)
            .Resume();

    }


    /**
 // aggregation
        try {

            const _docs = await this._users!.aggregate([
                { $match: { username: "many" } },
                { $group: { _id: "$username", total: { $sum: 1 } } }

            ]);

        } catch (e) {

        }
     */



}