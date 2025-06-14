import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IUser } from "../interfaces/user";
import { UserRole } from "../enums";
import commonSchema from "./common";

// User Schema
const userSchema = new Schema<IUser>({
  name: String,
  email: { type: String, unique: true, required: true },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  is_verified: { type: Boolean, default: false },
});

userSchema.add(commonSchema);
userSchema.plugin(mongoosePaginate);

export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
