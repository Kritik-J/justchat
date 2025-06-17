import type { ActionFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";

export async function action({ request }: ActionFunctionArgs) {
  const { threadId, userId, content, model, settings, guestSessionId } =
    await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const token of chatService.sendMessage(
        threadId,
        userId,
        content,
        model,
        settings || {},
        [], // attachments (not implemented)
        guestSessionId
      )) {
        controller.enqueue(token);
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
