import { chatService } from "~/services/chat.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { userId, title, guestSessionId } = await request.json();

  // Require either userId (for logged in users) or guestSessionId (for guests)
  if (!userId && !guestSessionId) {
    return new Response(
      JSON.stringify({ error: "Either userId or guestSessionId is required" }),
      {
        status: 400,
      }
    );
  }

  const thread = await chatService.startThread(userId, title, guestSessionId);
  return new Response(JSON.stringify({ threadId: thread._id }), {
    headers: { "Content-Type": "application/json" },
  });
}
