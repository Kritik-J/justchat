import {
  createConvexFileService,
  type FileMetadata,
  type SearchResult,
} from "@justchat/convex";
import { env } from "~/env.server";

class FileService {
  private convexService;

  constructor() {
    this.convexService = createConvexFileService(
      {
        convexUrl: env.CONVEX_URL,
      },
      {
        openaiApiKey: env.OPENAI_API_KEY,
      }
    );
  }

  /**
   * Upload and process a file with automatic text extraction and embedding generation
   */
  async uploadFile(
    file: File,
    userId?: string,
    options: {
      generateEmbeddings?: boolean;
      generateThumbnails?: boolean;
      extractText?: boolean;
    } = {}
  ): Promise<{
    success: boolean;
    fileId?: string;
    metadata?: FileMetadata;
    error?: string;
  }> {
    const {
      generateEmbeddings = !!env.OPENAI_API_KEY,
      generateThumbnails = true,
      extractText = true,
    } = options;

    try {
      return await this.convexService.uploadFile(
        file,
        {
          maxFileSizeBytes: 50 * 1024 * 1024, // 50MB
          generateThumbnails,
          extractText,
          generateEmbeddings: generateEmbeddings && !!env.OPENAI_API_KEY,
          allowedMimeTypes: [
            // Documents
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/csv",
            // Images
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/webp",
          ],
        },
        {
          model: "text-embedding-3-small",
          dimensions: 1536,
          chunkSize: 1000,
          chunkOverlap: 200,
        },
        userId
      );
    } catch (error) {
      console.error("File upload failed:", error);

      // Fallback: simple upload without processing
      return await this.simpleUpload(file, userId);
    }
  }

  /**
   * Fallback simple upload without text processing
   */
  private async simpleUpload(
    file: File,
    userId?: string
  ): Promise<{
    success: boolean;
    fileId?: string;
    metadata?: FileMetadata;
    error?: string;
  }> {
    try {
      // Just upload the file without processing
      return await this.convexService.uploadFile(
        file,
        {
          maxFileSizeBytes: 50 * 1024 * 1024,
          generateThumbnails: false,
          extractText: false,
          generateEmbeddings: false,
        },
        {},
        userId
      );
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      };
    }
  }

  /**
   * Search files using semantic similarity (only if embeddings available)
   */
  async searchFiles(
    query: string,
    options: {
      limit?: number;
      scoreThreshold?: number;
      fileTypes?: string[];
      userId?: string;
      fileIds?: string[];
    } = {}
  ): Promise<SearchResult[]> {
    if (!env.OPENAI_API_KEY) {
      console.warn("OpenAI API key not configured - semantic search disabled");
      return [];
    }

    try {
      return await this.convexService.searchFiles(
        query,
        {
          model: "text-embedding-3-small",
          dimensions: 1536,
        },
        {
          limit: options.limit || 10,
          scoreThreshold: options.scoreThreshold || 0.3, // Lower threshold
          fileTypes: options.fileTypes,
          userId: options.userId,
          fileIds: options.fileIds,
        }
      );
    } catch (error) {
      console.error("Search failed:", error);
      return [];
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(fileId: string): Promise<FileMetadata | null> {
    return await this.convexService.getFileMetadata(fileId);
  }

  /**
   * Get file download URL
   */
  async getFileUrl(fileId: string): Promise<string | null> {
    return await this.convexService.getFileUrl(fileId);
  }

  /**
   * List user files
   */
  async listUserFiles(
    userId?: string,
    options: {
      limit?: number;
      offset?: number;
      fileTypes?: string[];
    } = {}
  ): Promise<FileMetadata[]> {
    return await this.convexService.listFiles(userId, options);
  }

  /**
   * Delete a file and its embeddings
   */
  async deleteFile(fileId: string): Promise<boolean> {
    return await this.convexService.deleteFile(fileId);
  }

  /**
   * Enhanced search that can be used for RAG (only if available)
   */
  async searchForRAG(
    query: string,
    options: {
      maxResults?: number;
      scoreThreshold?: number;
      userId?: string;
      fileIds?: string[];
    } = {}
  ): Promise<{
    results: SearchResult[];
    context: string;
    sources: Array<{ fileId: string; filename: string; score: number }>;
  }> {
    if (!env.OPENAI_API_KEY) {
      console.log("❌ No OpenAI API key configured");
      return {
        results: [],
        context: "",
        sources: [],
      };
    }

    try {
      const searchResults = await this.searchFiles(query, {
        limit: options.maxResults || 5,
        scoreThreshold: options.scoreThreshold || 0.3, // Lower threshold to find more results
        userId: options.userId,
        fileIds: options.fileIds,
      });

      // Format context for LLM
      const context = searchResults
        .map((result, index) => {
          return `[Source ${index + 1}] ${result.fileMetadata.filename}:\n${result.chunk.text}\n`;
        })
        .join("\n");

      // Extract source information
      const sources = searchResults.map((result) => ({
        fileId: result.chunk.fileId,
        filename: result.fileMetadata.filename || "Unknown file",
        score: result.score,
      }));

      return {
        results: searchResults,
        context,
        sources,
      };
    } catch (error) {
      console.error("RAG search failed:", error);
      return {
        results: [],
        context: "",
        sources: [],
      };
    }
  }

  /**
   * Get embedding statistics for a file
   */
  async getFileEmbeddingStats(fileId: string): Promise<{
    chunkCount: number;
    totalTextLength: number;
  }> {
    try {
      return await this.convexService.getEmbeddingStats(fileId);
    } catch (error) {
      return { chunkCount: 0, totalTextLength: 0 };
    }
  }

  /**
   * Check if advanced features are available
   */
  get hasEmbeddingSupport(): boolean {
    return !!env.OPENAI_API_KEY;
  }
}

export const fileService = new FileService();
