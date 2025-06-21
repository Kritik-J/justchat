import { guestSessionService } from "~/services/guestSession.server";
import { authService } from "~/services/auth.server";
import type { ActionFunctionArgs } from "react-router";
import { logger } from "@justchat/logger";

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  try {
    const { guestSessionId, userId } = await request.json();

    if (!guestSessionId || !userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Both guestSessionId and userId are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Verify the user exists and is authenticated
    const user = await authService.getUser(request);
    if (!user || user._id.toString() !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Unauthorized",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Sync the guest session to the user
    const result = await guestSessionService.syncGuestToUser(
      guestSessionId,
      userId
    );

    logger.info(
      `Successfully synced guest session ${guestSessionId} to user ${userId}`
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: "Guest session synced successfully",
        data: result,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    logger.error("Error syncing guest session:", error);

    return new Response(
      JSON.stringify({
        success: false,
        message: "Failed to sync guest session",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
