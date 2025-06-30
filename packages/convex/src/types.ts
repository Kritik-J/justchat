import { z } from "zod";

// File types supported by the system
export type SupportedFileType =
  | "pdf"
  | "docx"
  | "txt"
  | "csv"
  | "image"
  | "unknown";

// File upload configuration
export const FileUploadConfigSchema = z.object({
  maxFileSizeBytes: z.number().default(10 * 1024 * 1024), // 10MB default
  allowedMimeTypes: z.array(z.string()).optional(),
  generateThumbnails: z.boolean().default(true),
  extractText: z.boolean().default(true),
  generateEmbeddings: z.boolean().default(true),
});

export type FileUploadConfig = z.infer<typeof FileUploadConfigSchema>;

// File metadata
export const FileMetadataSchema = z.object({
  id: z.string(),
  filename: z.string(),
  originalName: z.string(),
  mimeType: z.string(),
  size: z.number(),
  type: z.enum(["pdf", "docx", "txt", "csv", "image", "unknown"]),
  uploadedAt: z.number(),
  uploadedBy: z.string().optional(),
  storageUrl: z.string(),
  thumbnailUrl: z.string().optional(),
  extractedText: z.string().optional(),
  textLength: z.number().optional(),
  embeddingId: z.string().optional(),
  processingStatus: z.enum(["pending", "processing", "completed", "failed"]),
  processingError: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export type FileMetadata = z.infer<typeof FileMetadataSchema>;

// Embedding configuration
export const EmbeddingConfigSchema = z.object({
  model: z.string().default("text-embedding-3-small"),
  dimensions: z.number().default(1536),
  chunkSize: z.number().default(1000),
  chunkOverlap: z.number().default(200),
});

export type EmbeddingConfig = z.infer<typeof EmbeddingConfigSchema>;

// Text chunk for embedding
export const TextChunkSchema = z.object({
  id: z.string(),
  fileId: z.string(),
  text: z.string(),
  embedding: z.array(z.number()).optional(),
  startIndex: z.number().optional(),
  endIndex: z.number().optional(),
  metadata: z.record(z.any()).optional(),
});

export type TextChunk = z.infer<typeof TextChunkSchema>;

// Search result
export const SearchResultSchema = z.object({
  chunk: TextChunkSchema,
  score: z.number(),
  fileMetadata: FileMetadataSchema,
});

export type SearchResult = z.infer<typeof SearchResultSchema>;

// Upload result
export const UploadResultSchema = z.object({
  success: z.boolean(),
  fileId: z.string().optional(),
  convexFileId: z.string().optional(),
  metadata: FileMetadataSchema.optional(),
  error: z.string().optional(),
});

export type UploadResult = z.infer<typeof UploadResultSchema>;

// Service configurations
export interface ConvexFileServiceConfig {
  convexUrl: string;
  convexDeploymentUrl?: string;
}

export interface EmbeddingServiceConfig {
  openaiApiKey?: string;
}
