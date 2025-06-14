import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ISubscription } from "../interfaces/subscription";
import commonSchema from "./common";

// Subscription Schema
const subscriptionSchema = new Schema<ISubscription>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  plan: { type: Schema.Types.ObjectId, ref: "Plan", required: true },

  // TODO: Design the schema
});

subscriptionSchema.add(commonSchema);
subscriptionSchema.plugin(mongoosePaginate);

export const SubscriptionModel: Model<ISubscription> =
  mongoose.models.Subscription ||
  mongoose.model<ISubscription>("Subscription", subscriptionSchema);
