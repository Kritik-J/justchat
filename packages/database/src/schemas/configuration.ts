import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IConfiguration } from "../interfaces/configuration";
import commonSchema from "./common";

// Knowledgebase Schema
const configurationSchema = new Schema<IConfiguration>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // TODO: Design the schema
  // 1. Models -> gemini, claude, openai, etc. (name, type, api_key, api_base_url, api_version, api_type, api_model, api_model_version, api_model_id, api_model_name, api_model_description, api_model_created_at, api_model_updated_at, api_model_deleted_at, rules) -> array of objects
  // 2. Rules
  // 3. metadata

  // Rules should be applied to all the models, can be overridden by the model if needed

  // TBD: Different collections for different models
});

configurationSchema.index({ user: 1 }, { unique: true }); // Unique index for user

configurationSchema.add(commonSchema);
configurationSchema.plugin(mongoosePaginate);

export const ConfigurationModel: Model<IConfiguration> =
  mongoose.models.Configuration ||
  mongoose.model<IConfiguration>("Configuration", configurationSchema);
