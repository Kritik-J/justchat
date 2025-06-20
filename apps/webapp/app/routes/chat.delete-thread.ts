import type { ActionFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";

export async function action({ request }: ActionFunctionArgs) {
  const { threadId } = await request.json();
  if (!threadId) {
    return new Response("Missing threadId", { status: 400 });
  }
  await chatService.deleteThread(threadId);
  return new Response("OK");
}
