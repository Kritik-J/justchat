import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IPlan } from "./plan";
import { IUser } from "./user";

export interface ISubscription extends Document, TimeStamps {
  user: Schema.Types.ObjectId | IUser;
  plan: Schema.Types.ObjectId | IPlan;
}
