# @justchat/convex

A comprehensive package for file uploads, text extraction, and embedding generation using Convex as the backend database and storage solution.

## Features

- 📁 **File Upload & Storage**: Support for PDF, DOCX, TXT, CSV, and image files
- 🔍 **Text Extraction**: Automatic text extraction from supported file formats
- 🖼️ **Thumbnail Generation**: Automatic thumbnail creation for images
- 🧠 **Embeddings**: Generate and store embeddings using OpenAI or Pinecone
- 🔎 **Semantic Search**: Search files by semantic similarity
- 📊 **Type-Safe**: Full TypeScript support with Zod validation
- ⚡ **Real-time**: Built on Convex's reactive database

## Installation

```bash
pnpm add @justchat/convex
```

## Dependencies

This package requires the following external dependencies:

```bash
pnpm add convex openai
```

## Usage

### Basic Setup

```typescript
import { createConvexFileService } from "@justchat/convex";

const fileService = createConvexFileService(
  {
    convexUrl: "https://your-convex-deployment.convex.cloud",
  },
  {
    openaiApiKey: "your-openai-api-key",
  }
);
```

### Upload a File

```typescript
const file = document.getElementById("fileInput").files[0];

const result = await fileService.uploadFile(
  file,
  {
    maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
    generateThumbnails: true,
    extractText: true,
    generateEmbeddings: true,
  },
  {
    model: "text-embedding-3-small",
    dimensions: 1536,
    chunkSize: 1000,
  },
  "user-id-123"
);

if (result.success) {
  console.log("File uploaded:", result.fileId);
  console.log("Metadata:", result.metadata);
} else {
  console.error("Upload failed:", result.error);
}
```

### Search Files

```typescript
const searchResults = await fileService.searchFiles(
  "machine learning algorithms",
  {
    model: "text-embedding-3-small",
    dimensions: 1536,
  },
  {
    limit: 10,
    scoreThreshold: 0.7,
    userId: "user-id-123",
  }
);

searchResults.forEach((result) => {
  console.log(`Score: ${result.score}`);
  console.log(`Text: ${result.chunk.text}`);
  console.log(`File: ${result.fileMetadata.originalName}`);
});
```

### List User Files

```typescript
const files = await fileService.listFiles("user-id-123", {
  limit: 20,
  fileTypes: ["pdf", "docx"],
});

files.forEach((file) => {
  console.log(`${file.originalName} - ${file.size} bytes`);
});
```

### Delete a File

```typescript
const deleted = await fileService.deleteFile("file-id-123");

if (deleted) {
  console.log("File and embeddings deleted successfully");
}
```

## Supported File Types

- **PDF** (.pdf) - Text extraction with pdf-parse
- **Word Documents** (.docx) - Text extraction with mammoth
- **Text Files** (.txt) - Direct text reading
- **CSV Files** (.csv) - Structured data extraction
- **Images** (.jpg, .png, .gif, .webp) - Thumbnail generation (OCR support planned)

## Configuration Options

### FileUploadConfig

```typescript
interface FileUploadConfig {
  maxFileSizeBytes: number; // Default: 10MB
  allowedMimeTypes?: string[]; // Optional MIME type filtering
  generateThumbnails: boolean; // Default: true
  extractText: boolean; // Default: true
  generateEmbeddings: boolean; // Default: true
}
```

### EmbeddingConfig

```typescript
interface EmbeddingConfig {
  model: string; // Default: "text-embedding-3-small"
  dimensions: number; // Default: 1536
  chunkSize: number; // Default: 1000
  chunkOverlap: number; // Default: 200
}
```

## Convex Schema

You'll need to set up the following tables in your Convex schema:

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  files: defineTable({
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
    metadata: v.optional(v.object({})),
  })
    .index("by_user", ["uploadedBy"])
    .index("by_type", ["type"])
    .index("by_status", ["processingStatus"]),

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
```

## Required Convex Functions

Create these functions in your Convex backend:

```typescript
// convex/files.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: { metadata: v.any() },
  handler: async (ctx, args) => {
    return await ctx.db.insert("files", args.metadata);
  },
});

export const getById = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.fileId);
  },
});

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
      query = query.filter((q) => q.eq(q.field("uploadedBy"), args.userId));
    }

    return await query.order("desc").take(args.limit || 20);
  },
});

export const updateStatus = mutation({
  args: {
    fileId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      processingStatus: args.status,
      processingError: args.error,
    });
  },
});

export const deleteFile = mutation({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.fileId);
  },
});
```

## Environment Variables

```bash
# Required for OpenAI embeddings
OPENAI_API_KEY=your_openai_api_key
```

## License

MIT
