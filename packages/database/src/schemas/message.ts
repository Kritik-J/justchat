import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IMessage } from "../interfaces/message";
import commonSchema from "./common";

// Message Schema
const messageSchema = new Schema<IMessage>({
  thread: { type: Schema.Types.ObjectId, ref: "Thread", required: true },
  role: { type: String, required: true },
  content: { type: String, required: true },
  model_name: { type: String, required: true },
  // metadata: { type: Object, default: {} },
});

messageSchema.add(commonSchema);
messageSchema.plugin(mongoosePaginate);

export const MessageModel: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
