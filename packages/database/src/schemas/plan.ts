import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IPlan } from "../interfaces/plan";
import commonSchema from "./common";

// Plan Schema
const planSchema = new Schema<IPlan>({
  // TODO: Design the schema
});

planSchema.add(commonSchema);
planSchema.plugin(mongoosePaginate);

export const PlanModel: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>("Plan", planSchema);
