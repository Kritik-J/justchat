import type { ActionFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";

export async function action({ request }: ActionFunctionArgs) {
  const {
    threadId,
    userId,
    content,
    model,
    settings,
    guestSessionId,
    assistantMsgId,
  } = await request.json();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const token of chatService.sendMessage(
        threadId,
        userId,
        content,
        model,
        settings || {},
        [], // attachments (not implemented)
        guestSessionId,
        assistantMsgId
      )) {
        controller.enqueue(token);
      }
      controller.close();
    },
  });

  // After streaming, get the latest assistant message for the thread
  const latestMsg = await chatService.getLatestAssistantMessage(threadId);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Assistant-Message-Id": latestMsg?._id?.toString() || "",
    },
  });
}
