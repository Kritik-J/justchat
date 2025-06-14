import { Document } from "mongoose";
import { TimeStamps } from "./common";
import { UserRole } from "../enums";

export interface IUser extends Document, TimeStamps {
  name?: string;
  email: string;
  role: UserRole;
  is_verified: boolean;
}
