import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IThread } from "./thread";

export interface IMessage extends Document, TimeStamps {
  thread: Schema.Types.ObjectId | IThread;
  role: string;
  content: string;
  model_name: string;
  // metadata: {
  //   token_count: number;
  //   processing_time: number;
  //   cost: number;
  //   retry_count: number;
  // };
}
