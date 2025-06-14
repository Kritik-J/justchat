import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IMessage } from "../interfaces/message";
import commonSchema from "./common";

// Message Schema
const messageSchema = new Schema<IMessage>({
  thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },

  // TODO: Design the schema
  // 1. Role -> user | assistant
  // 2. Content -> Stringify JSON object
  // 3. Metadata -> object
});

messageSchema.add(commonSchema);
messageSchema.plugin(mongoosePaginate);

export const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
