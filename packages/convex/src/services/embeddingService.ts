import OpenAI from "openai";
import { ConvexHttpClient } from "convex/browser";
import type {
  EmbeddingConfig,
  EmbeddingServiceConfig,
  TextChunk,
  SearchResult,
} from "../types";

export class EmbeddingService {
  private openai?: OpenAI;
  private convex: ConvexHttpClient;
  private config: EmbeddingServiceConfig;

  constructor(config: EmbeddingServiceConfig, convexUrl: string) {
    this.config = config;
    this.convex = new ConvexHttpClient(convexUrl);

    if (config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    }
  }

  /**
   * Generate embeddings for text chunks
   */
  async generateEmbeddings(
    chunks: TextChunk[],
    embeddingConfig: EmbeddingConfig
  ): Promise<TextChunk[]> {
    if (!this.openai) {
      throw new Error(
        "OpenAI client not initialized. Please provide openaiApiKey."
      );
    }

    const texts = chunks.map((chunk) => chunk.text);

    try {
      const response = await this.openai.embeddings.create({
        model: embeddingConfig.model,
        input: texts,
        dimensions: embeddingConfig.dimensions,
      });

      return chunks.map((chunk, index) => ({
        ...chunk,
        embedding: response.data[index]?.embedding || [],
      }));
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error("Failed to generate embeddings");
    }
  }

  /**
   * Store embeddings in Convex vector store
   */
  async storeEmbeddings(
    chunks: TextChunk[],
    embeddingConfig: EmbeddingConfig
  ): Promise<void> {
    console.log(`Storing ${chunks.length} chunks with embeddings...`);

    try {
      // Store chunks with embeddings in Convex using an action
      for (const chunk of chunks) {
        if (chunk.embedding && chunk.embedding.length > 0) {
          console.log(
            `Storing chunk ${chunk.id} for file ${chunk.fileId} with ${chunk.embedding.length} dimensions`
          );

          await this.convex.action("embeddings:store" as any, {
            chunk: {
              id: chunk.id,
              fileId: chunk.fileId,
              text: chunk.text,
              embedding: chunk.embedding,
              startIndex: chunk.startIndex,
              endIndex: chunk.endIndex,
              metadata: chunk.metadata || {},
            },
          });

          console.log(`Successfully stored chunk ${chunk.id}`);
        } else {
          console.warn(`Chunk ${chunk.id} has no embedding, skipping...`);
        }
      }
      console.log("All chunks stored successfully");
    } catch (error) {
      console.error("Error storing embeddings to Convex:", error);
      throw new Error("Failed to store embeddings to Convex");
    }
  }

  /**
   * Search for similar text chunks using Convex vector search
   */
  async searchSimilar(
    query: string,
    embeddingConfig: EmbeddingConfig,
    limit: number = 10,
    scoreThreshold: number = 0.7,
    fileIds?: string[]
  ): Promise<SearchResult[]> {
    if (!this.openai) {
      throw new Error(
        "OpenAI client not initialized. Please provide openaiApiKey."
      );
    }

    try {
      // Generate embedding for the query
      const queryEmbeddingResponse = await this.openai.embeddings.create({
        model: embeddingConfig.model,
        input: query,
        dimensions: embeddingConfig.dimensions,
      });

      const queryEmbedding = queryEmbeddingResponse.data[0]?.embedding;
      if (!queryEmbedding) {
        throw new Error("Failed to generate query embedding");
      }

      // Search using Convex vector search action
      const results = await this.convex.action("embeddings:search" as any, {
        vector: queryEmbedding,
        limit,
        scoreThreshold,
        fileIds,
      });

      return results;
    } catch (error) {
      console.error("Error searching embeddings:", error);
      throw new Error("Failed to search embeddings");
    }
  }

  /**
   * Delete embeddings for a file
   */
  async deleteEmbeddings(fileId: string): Promise<void> {
    try {
      await this.convex.action("embeddings:deleteByFileId" as any, { fileId });
    } catch (error) {
      console.error("Error deleting embeddings:", error);
      throw new Error("Failed to delete embeddings");
    }
  }

  /**
   * Get embedding statistics for a file
   */
  async getEmbeddingStats(fileId: string): Promise<{
    chunkCount: number;
    totalTextLength: number;
  }> {
    try {
      return await this.convex.query("embeddings:getStats" as any, { fileId });
    } catch (error) {
      console.error("Error getting embedding stats:", error);
      return { chunkCount: 0, totalTextLength: 0 };
    }
  }

  /**
   * List all chunks for a file
   */
  async getFileChunks(fileId: string): Promise<TextChunk[]> {
    try {
      return await this.convex.query("embeddings:getByFileId" as any, {
        fileId,
      });
    } catch (error) {
      console.error("Error getting file chunks:", error);
      return [];
    }
  }
}
