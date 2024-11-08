import {
    Mng
} from "../deps.ts";
import {
    ApgMng_Spec_IUser_Schema,
} from "../interfaces/ApgMng_Spec_Schema_IUser.ts";




export class ApgMng_Collection_SpecUsers extends Mng.ApgMng_Collection<ApgMng_Spec_IUser_Schema> { 

    protected override initClassName(): string {
        return ApgMng_Collection_SpecUsers.name
    }

}