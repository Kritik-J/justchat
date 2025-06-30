import sharp from "sharp";
import mammoth from "mammoth";
import { parse as csvParse } from "csv-parse/sync";
import { fileTypeFromBuffer } from "file-type";
import { v4 as uuidv4 } from "uuid";
import { PdfReader } from "pdfreader";
import type { SupportedFileType, FileMetadata } from "../types.ts";

export class FileProcessor {
  /**
   * Detect file type from filename extension
   */
  static detectFileTypeFromFilename(filename: string): SupportedFileType {
    const extension = filename.toLowerCase().split(".").pop() || "";

    switch (extension) {
      case "pdf":
        return "pdf";
      case "docx":
        return "docx";
      case "txt":
        return "txt";
      case "csv":
        return "csv";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "webp":
      case "bmp":
        return "image";
      default:
        return "unknown";
    }
  }

  /**
   * Detect file type from buffer
   */
  static async detectFileType(
    buffer: Buffer,
    filename?: string
  ): Promise<SupportedFileType> {
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      // Fallback 1: try filename extension
      if (filename) {
        const typeFromFilename = this.detectFileTypeFromFilename(filename);
        if (typeFromFilename !== "unknown") {
          return typeFromFilename;
        }
      }

      // Fallback 2: try to detect text/csv from content
      const content = buffer.toString(
        "utf-8",
        0,
        Math.min(1000, buffer.length)
      );
      if (content.includes(",") && content.includes("\n")) {
        return "csv";
      }
      // Check if it's plain text
      if (/^[\x20-\x7E\s]*$/.test(content)) {
        return "txt";
      }
      return "unknown";
    }

    const mimeType = fileType.mime as string;

    switch (mimeType) {
      case "application/pdf":
        return "pdf";
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "docx";
      default:
        // Handle image types
        if (mimeType.startsWith("image/")) {
          return "image";
        }
        return "unknown";
    }
  }

  /**
   * Extract text content from file buffer
   */
  static async extractText(
    buffer: Buffer,
    fileType: SupportedFileType
  ): Promise<string> {
    switch (fileType) {
      case "pdf":
        return this.extractTextFromPdf(buffer);
      case "docx":
        return this.extractTextFromDocx(buffer);
      case "txt":
        return buffer.toString("utf-8");
      case "csv":
        return this.extractTextFromCsv(buffer);
      case "image":
        // For images, we would typically use OCR (like Tesseract)
        // For now, return empty string
        return "";
      default:
        return "";
    }
  }

  /**
   * Generate thumbnail for supported file types
   */
  static async generateThumbnail(
    buffer: Buffer,
    fileType: SupportedFileType
  ): Promise<Buffer | null> {
    if (fileType === "image") {
      try {
        return await sharp(buffer)
          .resize(200, 200, { fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toBuffer();
      } catch (error) {
        console.error("Error generating thumbnail:", error);
        return null;
      }
    }

    // For other file types, we could generate document previews
    // This would require additional libraries or services
    return null;
  }

  /**
   * Create file metadata
   */
  static createFileMetadata(
    originalName: string,
    buffer: Buffer,
    fileType: SupportedFileType,
    mimeType: string,
    uploadedBy?: string
  ): Omit<FileMetadata, "id" | "storageUrl" | "uploadedAt"> {
    return {
      filename: this.generateUniqueFilename(originalName),
      originalName,
      mimeType,
      size: buffer.length,
      type: fileType,
      uploadedBy,
      processingStatus: "pending" as const,
      metadata: {},
    };
  }

  /**
   * Generate unique filename
   */
  static generateUniqueFilename(originalName: string): string {
    const extension = originalName.split(".").pop() || "";
    const nameWithoutExt = originalName.replace(`.${extension}`, "");
    const timestamp = Date.now();
    const uuid = uuidv4().slice(0, 8);
    return `${nameWithoutExt}_${timestamp}_${uuid}.${extension}`;
  }

  /**
   * Split text into chunks for embedding
   */
  static splitTextIntoChunks(
    text: string,
    chunkSize: number = 1000,
    chunkOverlap: number = 200
  ): Array<{ text: string; startIndex: number; endIndex: number }> {
    const chunks: Array<{
      text: string;
      startIndex: number;
      endIndex: number;
    }> = [];
    let startIndex = 0;

    while (startIndex < text.length) {
      let endIndex = Math.min(startIndex + chunkSize, text.length);

      // Try to break at word boundaries
      if (endIndex < text.length) {
        const lastSpaceIndex = text.lastIndexOf(" ", endIndex);
        if (lastSpaceIndex > startIndex) {
          endIndex = lastSpaceIndex;
        }
      }

      const chunkText = text.slice(startIndex, endIndex).trim();
      if (chunkText.length > 0) {
        chunks.push({
          text: chunkText,
          startIndex,
          endIndex,
        });
      }

      // Move to next chunk with overlap
      startIndex = Math.max(endIndex - chunkOverlap, endIndex);
    }

    return chunks;
  }

  /**
   * Extract text from DOCX
   */
  private static async extractTextFromDocx(buffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (error) {
      console.error("Error extracting text from DOCX:", error);
      return "";
    }
  }

  /**
   * Extract text from CSV
   */
  private static extractTextFromCsv(buffer: Buffer): Promise<string> {
    try {
      const csvContent = buffer.toString("utf-8");
      const records = csvParse(csvContent, { skip_empty_lines: true });

      // Convert CSV data to text format
      return records.map((row: string[]) => row.join(" | ")).join("\n");
    } catch (error) {
      console.error("Error extracting text from CSV:", error);
      return Promise.resolve("");
    }
  }

  /**
   * Extract text from PDF
   */
  private static async extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve) => {
      let extractedText = "";
      let currentPage = 0;
      let hasError = false;

      const pdfReader = new PdfReader();

      pdfReader.parseBuffer(buffer, (err, item) => {
        if (hasError) return; // Prevent multiple resolves

        if (err) {
          console.error("Error parsing PDF:", err);
          hasError = true;
          const sizeInKB = Math.round(buffer.length / 1024);
          resolve(
            `PDF Document (${sizeInKB} KB) - Text extraction failed. File uploaded successfully and can be downloaded.`
          );
          return;
        }

        if (!item) {
          // End of file - return extracted text or helpful message
          if (extractedText.trim().length > 0) {
            resolve(extractedText.trim());
          } else {
            const sizeInKB = Math.round(buffer.length / 1024);
            resolve(
              `PDF Document (${sizeInKB} KB) - No extractable text found. The PDF may contain only images or scanned content. File uploaded successfully and can be downloaded.`
            );
          }
          return;
        }

        if (item.page) {
          // New page detected
          currentPage = item.page;
          if (currentPage > 1) {
            extractedText += "\n\n"; // Add page separator
          }
        } else if (item.text) {
          // Text item found - add to extracted text
          extractedText += item.text + " ";
        }
      });
    });
  }
}
