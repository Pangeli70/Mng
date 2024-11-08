export interface ApgMng_Spec_IUser {
  date: Date;
  username: string;
  password: string;
  group: string;
}

export interface ApgMng_Spec_IUser_Schema extends ApgMng_Spec_IUser {
  _id: { $oid: string; };
}
