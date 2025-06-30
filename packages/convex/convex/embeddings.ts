import { action, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const store = action({
  args: {
    chunk: v.object({
      id: v.string(),
      fileId: v.string(),
      text: v.string(),
      embedding: v.array(v.number()),
      startIndex: v.optional(v.number()),
      endIndex: v.optional(v.number()),
      metadata: v.object({}),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.embeddings.storeChunk, {
      chunkId: args.chunk.id,
      fileId: args.chunk.fileId,
      text: args.chunk.text,
      embedding: args.chunk.embedding,
      startIndex: args.chunk.startIndex,
      endIndex: args.chunk.endIndex,
      metadata: args.chunk.metadata,
    });
  },
});

// Internal mutation to store chunk
export const storeChunk = mutation({
  args: {
    chunkId: v.string(),
    fileId: v.string(),
    text: v.string(),
    embedding: v.array(v.number()),
    startIndex: v.optional(v.number()),
    endIndex: v.optional(v.number()),
    metadata: v.object({}),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("embeddings", {
      fileId: args.fileId,
      chunkId: args.chunkId,
      text: args.text,
      embedding: args.embedding,
      startIndex: args.startIndex,
      endIndex: args.endIndex,
      metadata: args.metadata,
    });
  },
});

// Vector search action
export const search = action({
  args: {
    vector: v.array(v.number()),
    limit: v.optional(v.number()),
    scoreThreshold: v.optional(v.number()),
    fileIds: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const results = await ctx.vectorSearch("embeddings", "by_embedding", {
      vector: args.vector,
      limit: args.limit || 10,
      filter: args.fileIds
        ? (q: any) =>
            q.or(
              ...args.fileIds!.map((fileId: string) => q.eq("fileId", fileId))
            )
        : undefined,
    });

    // Filter by score threshold if provided
    const filteredResults = args.scoreThreshold
      ? results.filter((result: any) => result._score >= args.scoreThreshold!)
      : results;

    // Get file metadata for each result
    const enrichedResults: any[] = [];
    for (const result of filteredResults) {
      // Get the full embedding document by ID
      const embeddingDoc = await ctx.runQuery(api.embeddings.getByEmbeddingId, {
        embeddingId: result._id,
      });

      if (!embeddingDoc) continue;

      const fileMetadata = await ctx.runQuery(api.files.getByCustomId, {
        customId: (embeddingDoc as any).fileId,
      });

      enrichedResults.push({
        chunk: {
          id: (embeddingDoc as any).chunkId,
          fileId: (embeddingDoc as any).fileId,
          text: (embeddingDoc as any).text,
          embedding: (embeddingDoc as any).embedding,
          startIndex: (embeddingDoc as any).startIndex,
          endIndex: (embeddingDoc as any).endIndex,
          metadata: (embeddingDoc as any).metadata,
        },
        score: result._score,
        fileMetadata,
      });
    }

    return enrichedResults;
  },
});

// Delete embeddings by file ID
export const deleteByFileId = action({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const chunks = await ctx.runQuery(api.embeddings.getByFileId, {
      fileId: args.fileId,
    });

    for (const chunk of chunks) {
      await ctx.runMutation(api.embeddings.deleteChunk, {
        chunkId: chunk._id,
      });
    }
  },
});

// Internal mutation to delete chunk
export const deleteChunk = mutation({
  args: { chunkId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.chunkId as any);
  },
});

// Get embeddings by file ID
export const getByFileId = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("embeddings")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .collect();
  },
});

// Get embedding statistics for a file
export const getStats = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const chunks = await ctx.db
      .query("embeddings")
      .withIndex("by_file", (q) => q.eq("fileId", args.fileId))
      .collect();

    const totalTextLength = chunks.reduce(
      (sum, chunk) => sum + chunk.text.length,
      0
    );

    return {
      chunkCount: chunks.length,
      totalTextLength,
    };
  },
});

// Get chunk by ID
export const getChunk = query({
  args: { chunkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("embeddings")
      .withIndex("by_chunk", (q) => q.eq("chunkId", args.chunkId))
      .first();
  },
});

// Get embedding by document ID
export const getByEmbeddingId = query({
  args: { embeddingId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.embeddingId as any);
  },
});

// List all embeddings (for debugging)
export const listAll = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("embeddings")
      .order("desc")
      .take(args.limit || 100);
  },
});

// Simple test function to debug connectivity
export const test = query({
  args: {},
  handler: async (ctx) => {
    console.log("Embeddings test function called successfully");
    return {
      message: "Embeddings functions are working!",
      timestamp: Date.now(),
    };
  },
});
