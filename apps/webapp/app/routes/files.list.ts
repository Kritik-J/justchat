import type { LoaderFunctionArgs } from "react-router";
import { fileService } from "~/services/file.server";
import { getUserSession } from "~/services/sessionStorage.server";

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit")) || 20;
    const offset = Number(url.searchParams.get("offset")) || 0;
    const fileTypes = url.searchParams.get("fileTypes")?.split(",");

    // Get user session
    const session = await getUserSession(request);
    const userId = session.get("userId") as string | undefined;

    // List user files
    const files = await fileService.listUserFiles(userId, {
      limit,
      offset,
      fileTypes,
    });

    return new Response(JSON.stringify({ success: true, files }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("File list error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Failed to list files",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
