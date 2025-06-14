import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IThread } from "./thread";

export interface IMessage extends Document, TimeStamps {
  thread: Schema.Types.ObjectId | IThread;
}
