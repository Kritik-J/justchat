import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { ILLM } from "../interfaces/llm";
import commonSchema from "./common";

const llmSchema = new Schema<ILLM>({
  name: { type: String, required: true },
  model_name: { type: String, required: true },
  is_active: { type: Boolean, default: true },
  capabilities: {
    text_generation: { type: Boolean, default: false },
    image_generation: { type: Boolean, default: false },
  },
  settings: { type: Object, default: {} },
});

llmSchema.add(commonSchema);
llmSchema.plugin(mongoosePaginate);

export const LLMModel: Model<ILLM> =
  mongoose.models.LLM || mongoose.model<ILLM>("LLM", llmSchema);
