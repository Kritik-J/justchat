import type { AppLoadContext, EntryContext } from "react-router";
import { dbClient } from "@justchat/database";
import { logger } from "@justchat/logger";
import { env } from "./env.server";

export const streamTimeout = 5_000;

// Initialize MongoDB connection
let db: Awaited<ReturnType<typeof dbClient>>;

// Connect to MongoDB once at startup
dbClient(env.MONGO_URI)
  .then((database) => {
    db = database;
    logger.info("Connected to MongoDB");
  })
  .catch((error) => {
    logger.error("Error connecting to MongoDB", error);
    process.exit(1); // Exit if we can't connect to the database
  });

import { handleRequest } from "@vercel/react-router/entry.server";

export default async function (
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext?: AppLoadContext
): Promise<Response> {
  const nonce = crypto.randomUUID();
  const response = await handleRequest(
    request,
    responseStatusCode,
    responseHeaders,
    routerContext,
    loadContext,
    { nonce }
  );
  response.headers.set(
    "Content-Security-Policy",
    `script-src 'nonce-${nonce}'`
  );
  return response;
}
