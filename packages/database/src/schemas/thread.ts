import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IThread } from "../interfaces/thread";
import commonSchema from "./common";

// Chat Schema
const chatSchema = new Schema<IThread>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

chatSchema.index({ user: 1 }, { unique: true }); // Unique index for user

chatSchema.add(commonSchema);
chatSchema.plugin(mongoosePaginate);

export const ThreadModel: Model<IThread> =
  mongoose.models.Chat || mongoose.model<IThread>("Thread", chatSchema);
