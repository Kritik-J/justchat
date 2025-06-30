import { z } from "zod";

const EnvironmentSchema = z.object({
  NODE_ENV: z.union([z.literal("development"), z.literal("production")]),
  SESSION_SECRET: z.string(),
  EMAIL_USER: z.string(),
  EMAIL_PASS: z.string(),
  MONGO_URI: z.string(),
  APP_URL: z.string(),
  GROQ_API_KEY: z.string(),
  TAVILY_API_KEY: z.string(),
  CONVEX_URL: z.string(),
  OPENAI_API_KEY: z.string().optional(), // Optional since embeddings are configurable
});

export type Environment = z.infer<typeof EnvironmentSchema>;
export const env = EnvironmentSchema.parse(process.env);
