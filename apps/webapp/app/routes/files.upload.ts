import type { ActionFunctionArgs } from "react-router";
import { fileService } from "~/services/file.server";
import { getUserSession } from "~/services/sessionStorage.server";

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response(
        JSON.stringify({ success: false, error: "No file provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `Uploading file: ${file.name}, size: ${file.size}, type: ${file.type}`
    );

    // Get user session (support both authenticated and guest users)
    const session = await getUserSession(request);
    const userId = session.get("userId") as string | undefined;

    console.log(`User ID: ${userId || "guest"}`);

    // Upload and process the file
    const result = await fileService.uploadFile(file, userId, {
      generateEmbeddings: true,
      generateThumbnails: true,
      extractText: true,
    });

    console.log("Upload result:", result);

    if (!result.success) {
      console.error("Upload failed:", result.error);
      return new Response(
        JSON.stringify({ success: false, error: result.error }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if embeddings were created (for debugging)
    if (result.fileId) {
      try {
        const stats = await fileService.getFileEmbeddingStats(result.fileId);
        console.log(`Embedding stats for ${result.fileId}:`, stats);
      } catch (error) {
        console.error("Failed to get embedding stats:", error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        fileId: result.fileId,
        metadata: result.metadata,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("File upload error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Upload failed",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
