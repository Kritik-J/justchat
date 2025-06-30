// Main service exports
export { ConvexFileService } from "./services/convexFileService";
export { EmbeddingService } from "./services/embeddingService";

// Utility exports
export { FileProcessor } from "./utils/fileProcessor";

// Type exports
export type {
  SupportedFileType,
  FileUploadConfig,
  FileMetadata,
  EmbeddingConfig,
  TextChunk,
  SearchResult,
  UploadResult,
  ConvexFileServiceConfig,
  EmbeddingServiceConfig,
} from "./types";

// Schema exports for validation
export {
  FileUploadConfigSchema,
  FileMetadataSchema,
  EmbeddingConfigSchema,
  TextChunkSchema,
  SearchResultSchema,
  UploadResultSchema,
} from "./types";

// Import types for default configurations
import type {
  FileUploadConfig,
  EmbeddingConfig,
  ConvexFileServiceConfig,
  EmbeddingServiceConfig,
} from "./types";
import { ConvexFileService } from "./services/convexFileService";

// Default configurations
export const defaultFileUploadConfig: FileUploadConfig = {
  maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
  generateThumbnails: true,
  extractText: true,
  generateEmbeddings: true,
};

export const defaultEmbeddingConfig: EmbeddingConfig = {
  model: "text-embedding-3-small",
  dimensions: 1536,
  chunkSize: 1000,
  chunkOverlap: 200,
};

// Convenience function to create a fully configured service
export function createConvexFileService(
  convexConfig: ConvexFileServiceConfig,
  embeddingConfig: EmbeddingServiceConfig
): ConvexFileService {
  return new ConvexFileService(convexConfig, embeddingConfig);
}
