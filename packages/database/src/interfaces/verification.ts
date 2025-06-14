import { Document } from "mongoose";
import { TimeStamps } from "./common";

export interface IVerification extends Document, TimeStamps {
  identifier: string;
  token: string;
  expires_at: Date;
}
