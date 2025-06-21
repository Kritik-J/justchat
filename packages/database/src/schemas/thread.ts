import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IThread } from "../interfaces/thread";
import commonSchema from "./common";
import { MessageModel } from "./message";

// Chat Schema
const chatSchema = new Schema<IThread>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: false },
  title: { type: String, default: "" },
  model_name: { type: String, default: "gemini" },
  is_active: { type: Boolean, default: true },
  settings: {
    temperature: { type: Number, default: 0.5 },
    max_tokens: { type: Number, default: 1000 },
    system_prompt: { type: String, default: "" },
  },
  metadata: { type: Object, default: {} },
  guestSessionId: { type: String, required: false },
});

chatSchema.add(commonSchema);
chatSchema.plugin(mongoosePaginate);

// Add cascade delete for messages when a thread is deleted
chatSchema.pre("findOneAndDelete", async function (next) {
  const threadId = this.getQuery()["_id"];
  if (threadId) {
    await MessageModel.deleteMany({ thread: threadId });
  }
  next();
});

export const ThreadModel: Model<IThread> =
  mongoose.models.Chat || mongoose.model<IThread>("Thread", chatSchema);
