import { logger } from "@justchat/logger";
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
    enableRAG,
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
        enableWebSearch,
        enableRAG
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
      "X-Assistant-Message-Id": actualMessageId,
    },
  });
}
