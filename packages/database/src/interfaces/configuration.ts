import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IUser } from "./user";

export interface IConfiguration extends Document, TimeStamps {
  user: Schema.Types.ObjectId | IUser;
}
