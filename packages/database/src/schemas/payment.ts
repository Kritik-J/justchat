import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IPayment } from "../interfaces/payment";
import commonSchema from "./common";

// Payment Schema
const paymentSchema = new Schema<IPayment>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  subscription: {
    type: Schema.Types.ObjectId,
    ref: "Subscription",
    required: true,
  },

  // TODO: Design the schema
});

paymentSchema.add(commonSchema);
paymentSchema.plugin(mongoosePaginate);

export const PaymentModel: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", paymentSchema);
