import type { ActionFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";

export async function action({ request }: ActionFunctionArgs) {
  const { threadId, updates } = await request.json();
  if (!threadId || !updates || typeof updates !== "object") {
    return new Response("Missing threadId or updates", { status: 400 });
  }
  await chatService.updateThread(threadId, updates);
  return new Response("OK");
}
