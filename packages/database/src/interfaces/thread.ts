import { Document, Schema } from "mongoose";
import { TimeStamps } from "./common";
import { IUser } from "./user";

export interface IThread extends Document, TimeStamps {
  user: Schema.Types.ObjectId | IUser;
  title: string;
  model_name: string;
  is_active: boolean;
  settings: {
    temperature: number;
    max_tokens: number;
    system_prompt: string;
  };
  metadata: Record<string, any>;
  guestSessionId?: string;
}
