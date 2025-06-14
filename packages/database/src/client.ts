import mongoose from "mongoose";

export const dbClient = async (mongoUri: string) =>
  await mongoose.connect(mongoUri);

export type DBClient = typeof mongoose;
