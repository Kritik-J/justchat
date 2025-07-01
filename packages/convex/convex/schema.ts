import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
    customId: v.string(), // Store the UUID here for easy lookups
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
    storageUrl: v.string(), // Convex storage ID
    thumbnailUrl: v.optional(v.string()), // Convex storage ID for thumbnail
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
    uploadedAt: v.number(), // Timestamp
    updatedAt: v.number(), // Timestamp
    metadata: v.optional(v.object({})),
  })
    .index("by_custom_id", ["customId"])
    .index("by_user", ["uploadedBy"])
    .index("by_type", ["type"])
    .index("by_status", ["processingStatus"])
    .index("by_uploaded_at", ["uploadedAt"])
    .searchIndex("search_text", {
      searchField: "extractedText",
      filterFields: ["uploadedBy", "type", "processingStatus"],
    }),

  embeddings: defineTable({
    fileId: v.string(),
    chunkId: v.string(),
    text: v.string(),
    embedding: v.array(v.number()),
    startIndex: v.optional(v.number()),
    endIndex: v.optional(v.number()),
    metadata: v.optional(v.object({})),
  })
    .index("by_file", ["fileId"])
    .index("by_chunk", ["chunkId"])
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 1536,
      filterFields: ["fileId"],
    }),
});
