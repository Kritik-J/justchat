import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";

export interface ILLM extends Document, TimeStamps {
  name: string;
  model_name: string;
  is_active: boolean;
  capabilities: {
    text_generation: boolean;
    image_generation: boolean;
  };
  settings: {
    temperature: number;
    max_tokens: number;
    system_prompt: string;
  };
}
