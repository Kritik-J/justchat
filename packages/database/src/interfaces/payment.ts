import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { ISubscription } from "./subscription";
import { IUser } from "./user";

export interface IPayment extends Document, TimeStamps {
  user: Schema.Types.ObjectId | IUser;
  subscription: Schema.Types.ObjectId | ISubscription;
}
