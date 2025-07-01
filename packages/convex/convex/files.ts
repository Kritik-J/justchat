import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Generate upload URL for file upload
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Create file metadata record
export const create = mutation({
  args: {
    metadata: v.object({
      id: v.string(),
      filename: v.string(),
      originalName: v.string(),
      mimeType: v.string(),
      size: v.number(),
      type: v.union(
        v.literal("pdf"),
        v.literal("docx"),
        v.literal("txt"),
        v.literal("csv"),
        v.literal("image"),
        v.literal("unknown")
      ),
      uploadedBy: v.optional(v.string()),
      storageUrl: v.string(),
      thumbnailUrl: v.optional(v.string()),
      extractedText: v.optional(v.string()),
      textLength: v.optional(v.number()),
      embeddingId: v.optional(v.string()),
      processingStatus: v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      ),
      processingError: v.optional(v.string()),
      uploadedAt: v.number(),
      metadata: v.optional(v.object({})),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", {
      customId: args.metadata.id,
      filename: args.metadata.filename,
      originalName: args.metadata.originalName,
      mimeType: args.metadata.mimeType,
      size: args.metadata.size,
      type: args.metadata.type,
      uploadedBy: args.metadata.uploadedBy,
      storageUrl: args.metadata.storageUrl,
      thumbnailUrl: args.metadata.thumbnailUrl,
      extractedText: args.metadata.extractedText,
      textLength: args.metadata.textLength,
      embeddingId: args.metadata.embeddingId,
      processingStatus: args.metadata.processingStatus,
      processingError: args.metadata.processingError,
      uploadedAt: args.metadata.uploadedAt,
      updatedAt: Date.now(),
      metadata: args.metadata.metadata || {},
    });
  },
});

// Get file by ID
export const getById = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId as any);
  },
});

// Get file URL from storage ID
export const getUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});

// List files with optional filtering
export const list = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    fileTypes: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("files");

    if (args.userId) {
      query = query.withIndex("by_user", (q) =>
        q.eq("uploadedBy", args.userId)
      ) as any;
    }

    if (args.fileTypes && args.fileTypes.length > 0) {
      query = query.filter((q) =>
        q.or(...args.fileTypes!.map((type) => q.eq(q.field("type"), type)))
      );
    }

    return await query.order("desc").take(args.limit || 20);
  },
});

// Update file processing status
export const updateStatus = mutation({
  args: {
    customId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Find the file by customId first
    const file = await ctx.db
      .query("files")
      .withIndex("by_custom_id", (q) => q.eq("customId", args.customId))
      .first();

    if (!file) {
      throw new Error(`File with customId ${args.customId} not found`);
    }

    // Update using the actual Convex document ID
    await ctx.db.patch(file._id, {
      processingStatus: args.status,
      processingError: args.error,
      updatedAt: Date.now(),
    });
  },
});

// Delete file
export const deleteFile = mutation({
  args: { customId: v.string() },
  handler: async (ctx, args) => {
    // Find the file by customId first
    const file = await ctx.db
      .query("files")
      .withIndex("by_custom_id", (q) => q.eq("customId", args.customId))
      .first();

    if (!file) {
      throw new Error(`File with customId ${args.customId} not found`);
    }

    // Delete using the actual Convex document ID
    await ctx.db.delete(file._id);
  },
});

// Search files by text content
export const searchByText = query({
  args: {
    searchTerm: v.string(),
    userId: v.optional(v.string()),
    fileTypes: v.optional(v.array(v.string())),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let results = await ctx.db
      .query("files")
      .withSearchIndex("search_text", (q) =>
        q.search("extractedText", args.searchTerm)
      )
      .take(args.limit || 10);

    // Apply additional filters
    if (args.userId) {
      results = results.filter((file) => file.uploadedBy === args.userId);
    }

    if (args.fileTypes && args.fileTypes.length > 0) {
      results = results.filter((file) => args.fileTypes!.includes(file.type));
    }

    return results;
  },
});

// Get file by custom ID (UUID)
export const getByCustomId = query({
  args: { customId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("files")
      .withIndex("by_custom_id", (q) => q.eq("customId", args.customId))
      .first();
  },
});
