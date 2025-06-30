import { ConvexHttpClient } from "convex/browser";
import { v4 as uuidv4 } from "uuid";
import { FileProcessor } from "../utils/fileProcessor";
import { EmbeddingService } from "./embeddingService";
import type {
  FileUploadConfig,
  EmbeddingConfig,
  ConvexFileServiceConfig,
  EmbeddingServiceConfig,
  FileMetadata,
  UploadResult,
  SearchResult,
  TextChunk,
} from "../types";

export class ConvexFileService {
  private convex: ConvexHttpClient;
  private embeddingService: EmbeddingService;
  private config: ConvexFileServiceConfig;

  constructor(
    convexConfig: ConvexFileServiceConfig,
    embeddingConfig: EmbeddingServiceConfig
  ) {
    this.config = convexConfig;
    this.convex = new ConvexHttpClient(convexConfig.convexUrl);
    this.embeddingService = new EmbeddingService(
      embeddingConfig,
      convexConfig.convexUrl
    );
  }

  /**
   * Upload and process a file using Convex file storage
   */
  async uploadFile(
    file: File,
    uploadConfig: Partial<FileUploadConfig> = {},
    embeddingConfig: Partial<EmbeddingConfig> = {},
    userId?: string
  ): Promise<UploadResult> {
    try {
      // Validate file size
      const config = { maxFileSizeBytes: 10 * 1024 * 1024, ...uploadConfig };
      if (file.size > config.maxFileSizeBytes) {
        return {
          success: false,
          error: `File size exceeds maximum allowed size of ${config.maxFileSizeBytes} bytes`,
        };
      }

      // Validate MIME type if specified
      if (
        config.allowedMimeTypes &&
        !config.allowedMimeTypes.includes(file.type)
      ) {
        return {
          success: false,
          error: `File type ${file.type} is not allowed`,
        };
      }

      // Convert file to buffer for processing
      const buffer = Buffer.from(await file.arrayBuffer());

      // Detect file type
      const fileType = await FileProcessor.detectFileType(buffer, file.name);

      // Step 1: Generate upload URL
      const uploadUrl = await this.convex.mutation(
        "files:generateUploadUrl" as any
      );

      // Step 2: Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      const { storageId } = await uploadResponse.json();

      // Generate thumbnail if requested
      let thumbnailStorageId: string | undefined;
      if (config.generateThumbnails) {
        const thumbnail = await FileProcessor.generateThumbnail(
          buffer,
          fileType
        );
        if (thumbnail) {
          const thumbnailUploadUrl = await this.convex.mutation(
            "files:generateUploadUrl" as any
          );
          // Convert Buffer to Uint8Array for Blob constructor
          const thumbnailArray = new Uint8Array(thumbnail);
          const thumbnailBlob = new Blob([thumbnailArray], {
            type: "image/jpeg",
          });

          const thumbnailUploadResponse = await fetch(thumbnailUploadUrl, {
            method: "POST",
            headers: { "Content-Type": "image/jpeg" },
            body: thumbnailBlob,
          });

          if (thumbnailUploadResponse.ok) {
            const thumbnailResult = await thumbnailUploadResponse.json();
            thumbnailStorageId = thumbnailResult.storageId;
          }
        }
      }

      // Extract text if requested
      let extractedText: string | undefined;
      if (config.extractText) {
        extractedText = await FileProcessor.extractText(buffer, fileType);
      }

      // Create file metadata
      const fileId = uuidv4();
      const fileMetadata: FileMetadata = {
        id: fileId,
        filename: FileProcessor.generateUniqueFilename(file.name),
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        type: fileType,
        uploadedBy: userId,
        storageUrl: storageId, // Store the storage ID
        thumbnailUrl: thumbnailStorageId,
        extractedText,
        textLength: extractedText?.length,
        uploadedAt: Date.now(), // Use timestamp instead of Date object
        processingStatus: "processing",
        metadata: {},
      };

      // Step 3: Save file metadata to database
      const convexFileId = await this.convex.mutation("files:create" as any, {
        metadata: fileMetadata,
      });

      // Generate embeddings if requested and text is available
      if (config.generateEmbeddings && extractedText) {
        await this.processEmbeddings(fileId, extractedText, embeddingConfig);
      }

      // Update processing status using the custom ID (UUID)
      await this.updateFileStatus(fileId, "completed");

      return {
        success: true,
        fileId,
        metadata: fileMetadata,
        convexFileId, // Also return the Convex ID for reference
      };
    } catch (error) {
      console.error("Error uploading file:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Search files by text similarity using Convex vector search
   */
  async searchFiles(
    query: string,
    embeddingConfig: Partial<EmbeddingConfig> = {},
    options: {
      limit?: number;
      scoreThreshold?: number;
      fileTypes?: string[];
      userId?: string;
      fileIds?: string[];
    } = {}
  ): Promise<SearchResult[]> {
    const config = {
      model: "text-embedding-3-small" as const,
      dimensions: 1536,
      chunkSize: 1000,
      chunkOverlap: 200,
      ...embeddingConfig,
    };

    try {
      // If userId is specified, filter by user's files first
      let searchFileIds = options.fileIds;

      if (options.userId && !searchFileIds) {
        const userFiles = await this.listFiles(options.userId, { limit: 100 });
        searchFileIds = userFiles.map((f) => f.id);

        if (searchFileIds.length === 0) {
          return [];
        }
      }

      const results = await this.embeddingService.searchSimilar(
        query,
        config,
        options.limit,
        options.scoreThreshold,
        searchFileIds
      );

      return results;
    } catch (error) {
      console.error("ConvexFileService.searchFiles error:", error);
      return [];
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    try {
      const file = await this.convex.query("files:getByCustomId" as any, {
        customId: fileId,
      });
      if (!file) return null;

      // Convert Convex file record back to FileMetadata format
      return {
        id: file.customId,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: file.type,
        uploadedBy: file.uploadedBy,
        storageUrl: file.storageUrl,
        thumbnailUrl: file.thumbnailUrl,
        extractedText: file.extractedText,
        textLength: file.textLength,
        uploadedAt: file.uploadedAt,
        processingStatus: file.processingStatus,
        metadata: file.metadata || {},
      };
    } catch (error) {
      console.error("Error getting file metadata:", error);
      return null;
    }
  }

  /**
   * Get file URL for download/viewing
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    try {
      const metadata = await this.getFileMetadata(fileId);
      if (!metadata) return null;

      // Get the file URL from Convex storage
      return await this.convex.query("files:getUrl" as any, {
        storageId: metadata.storageUrl,
      });
    } catch (error) {
      console.error("Error getting file URL:", error);
      return null;
    }
  }

  /**
   * List user files
   */
  async listFiles(
    userId?: string,
    options: {
      limit?: number;
      offset?: number;
      fileTypes?: string[];
    } = {}
  ): Promise<FileMetadata[]> {
    try {
      const files = await this.convex.query("files:list" as any, {
        userId,
        ...options,
      });

      // Convert Convex file records back to FileMetadata format
      return files.map((file: any) => ({
        id: file.customId,
        filename: file.filename,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        type: file.type,
        uploadedBy: file.uploadedBy,
        storageUrl: file.storageUrl,
        thumbnailUrl: file.thumbnailUrl,
        extractedText: file.extractedText,
        textLength: file.textLength,
        uploadedAt: file.uploadedAt,
        processingStatus: file.processingStatus,
        metadata: file.metadata || {},
      }));
    } catch (error) {
      console.error("Error listing files:", error);
      return [];
    }
  }

  /**
   * Delete file and its embeddings
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      // Delete embeddings first
      await this.embeddingService.deleteEmbeddings(fileId);

      // Delete file metadata (Convex will handle storage cleanup)
      await this.convex.mutation("files:deleteFile" as any, {
        customId: fileId,
      });

      return true;
    } catch (error) {
      console.error("Error deleting file:", error);
      return false;
    }
  }

  /**
   * Reprocess file embeddings
   */
  async reprocessEmbeddings(
    fileId: string,
    embeddingConfig: Partial<EmbeddingConfig> = {}
  ): Promise<boolean> {
    try {
      const fileMetadata = await this.getFileMetadata(fileId);
      if (!fileMetadata || !fileMetadata.extractedText) {
        return false;
      }

      // Delete existing embeddings
      await this.embeddingService.deleteEmbeddings(fileId);

      // Generate new embeddings
      await this.processEmbeddings(
        fileId,
        fileMetadata.extractedText,
        embeddingConfig
      );

      return true;
    } catch (error) {
      console.error("Error reprocessing embeddings:", error);
      return false;
    }
  }

  /**
   * Get embedding statistics for a file
   */
  async getEmbeddingStats(fileId: string): Promise<{
    chunkCount: number;
    totalTextLength: number;
  }> {
    return this.embeddingService.getEmbeddingStats(fileId);
  }

  /**
   * Get all text chunks for a file
   */
  async getFileChunks(fileId: string): Promise<TextChunk[]> {
    return this.embeddingService.getFileChunks(fileId);
  }

  /**
   * Update file processing status
   */
  private async updateFileStatus(
    customId: string,
    status: "pending" | "processing" | "completed" | "failed",
    error?: string
  ): Promise<void> {
    try {
      await this.convex.mutation("files:updateStatus" as any, {
        customId,
        status,
        error,
      });
    } catch (error) {
      console.error("Error updating file status:", error);
      throw error;
    }
  }

  /**
   * Process embeddings for extracted text
   */
  private async processEmbeddings(
    fileId: string,
    text: string,
    embeddingConfig: Partial<EmbeddingConfig>
  ): Promise<void> {
    console.log(
      `Processing embeddings for file ${fileId}, text length: ${text.length}`
    );

    const config = {
      model: "text-embedding-3-small" as const,
      dimensions: 1536,
      chunkSize: 1000,
      chunkOverlap: 200,
      ...embeddingConfig,
    };

    // Split text into chunks
    const textChunks = FileProcessor.splitTextIntoChunks(
      text,
      config.chunkSize,
      config.chunkOverlap
    );

    console.log(`Split text into ${textChunks.length} chunks`);

    // Create TextChunk objects
    const chunks: TextChunk[] = textChunks.map((chunk, index) => ({
      id: `${fileId}_chunk_${index}`,
      fileId,
      text: chunk.text,
      startIndex: chunk.startIndex,
      endIndex: chunk.endIndex,
      metadata: {},
    }));

    console.log(`Created ${chunks.length} TextChunk objects`);

    // Generate embeddings
    const chunksWithEmbeddings = await this.embeddingService.generateEmbeddings(
      chunks,
      config
    );

    console.log(
      `Generated embeddings for ${chunksWithEmbeddings.length} chunks`
    );

    // Store embeddings in Convex
    await this.embeddingService.storeEmbeddings(chunksWithEmbeddings, config);

    console.log(`Completed embedding processing for file ${fileId}`);
  }
}
