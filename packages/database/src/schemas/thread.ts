import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IThread } from "../interfaces/thread";
import commonSchema from "./common";

// Chat Schema
const chatSchema = new Schema<IThread>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
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

export const ThreadModel: Model<IThread> =
  mongoose.models.Chat || mongoose.model<IThread>("Thread", chatSchema);
