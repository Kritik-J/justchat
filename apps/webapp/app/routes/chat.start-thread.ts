import { chatService } from "~/services/chat.server";
import type { ActionFunctionArgs } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { userId, title } = await request.json();
  if (!userId) {
    return new Response(JSON.stringify({ error: "userId is required" }), {
      status: 400,
    });
  }
  const thread = await chatService.startThread(userId, title);
  return new Response(JSON.stringify({ threadId: thread._id }), {
    headers: { "Content-Type": "application/json" },
  });
}
