import mongoose, { Model, Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import { IVerification } from "../interfaces/verification";
import commonSchema from "./common";

const verificationSchema = new Schema<IVerification>({
  identifier: { type: String, required: true },
  token: { type: String, required: true },
  expires_at: { type: Date, required: true },
});

// Add a compound unique index for identifier and token
verificationSchema.index({ identifier: 1, token: 1 }, { unique: true });
verificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 }); // TTL index
verificationSchema.add(commonSchema);
verificationSchema.plugin(mongoosePaginate);

export const VerificationModel: Model<IVerification> =
  mongoose.models.Verification ||
  mongoose.model<IVerification>("Verification", verificationSchema);
