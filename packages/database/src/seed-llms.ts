import "dotenv/config";
import mongoose from "mongoose";
import { LLMModel } from "./schemas/llm";

const models = [
  { name: "Gemma 2 9B (Google)", model_name: "gemma2-9b-it" },
  {
    name: "Llama Guard 4 12B (Meta)",
    model_name: "meta-llama/llama-guard-4-12b",
  },
  {
    name: "Llama 3.3 70B Versatile (Meta)",
    model_name: "llama-3.3-70b-versatile",
  },
  { name: "Llama 3.1 8B Instant (Meta)", model_name: "llama-3.1-8b-instant" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI!);

  for (const model of models) {
    await LLMModel.updateOne(
      { model_name: model.model_name },
      {
        $set: {
          ...model,
          is_active: true,
          capabilities: { text_generation: true },
        },
      },
      { upsert: true }
    );
  }

  console.log("Seeded LLM models!");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
