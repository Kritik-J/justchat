import { chatService } from "~/services/chat.server";
import { authService } from "~/services/auth.server";
import type { ActionFunctionArgs } from "react-router";

function getCookieValue(
  cookieHeader: string | null,
  name: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split("=");
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const { shareId, title } = await request.json();

  if (!shareId) {
    return new Response(JSON.stringify({ error: "Share ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Get user if logged in
    const user = await authService.getUser(request);

    let userId: string | undefined;
    let guestSessionId: string | undefined;

    if (user) {
      userId = user._id;
    } else {
      // Get guest session ID from cookie
      const cookieHeader = request.headers.get("cookie");
      guestSessionId =
        getCookieValue(cookieHeader, "guestSessionId") || undefined;

      if (!guestSessionId) {
        return new Response(
          JSON.stringify({ error: "No guest session found" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    const newThreadId = await chatService.forkThread(
      shareId,
      userId,
      guestSessionId,
      title
    );

    return new Response(JSON.stringify({ threadId: newThreadId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error forking thread:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to fork thread",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
