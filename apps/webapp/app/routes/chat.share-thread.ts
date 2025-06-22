import { chatService } from "~/services/chat.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { threadId } = await request.json();

  if (!threadId) {
    return new Response(JSON.stringify({ error: "Thread ID is required" }), {
      status: 400,
    });
  }

  try {
    const shareId = await chatService.shareThread(threadId);
    return new Response(JSON.stringify({ shareId }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to share thread" }), {
      status: 500,
    });
  }
}
