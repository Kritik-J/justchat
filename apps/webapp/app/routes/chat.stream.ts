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
    enableWebSearch,
  } = await request.json();

  let actualMessageId = "";

  const stream = new ReadableStream({
    async start(controller) {
      const generator = chatService.sendMessage(
        threadId,
        userId,
        content,
        model,
        settings || {},
        [],
        guestSessionId,
        assistantMsgId,
        enableWebSearch
      );

      for await (const chunk of generator) {
        if (typeof chunk === "string") {
          controller.enqueue(chunk);
        } else {
          // This is the final return value with messageId
          actualMessageId = (chunk as any).messageId;
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "X-Assistant-Message-Id": actualMessageId,
    },
  });
}
