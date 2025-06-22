import type { LoaderFunctionArgs } from "react-router";
import { chatService } from "~/services/chat.server";
import { useLoaderData } from "react-router";
import ChatView from "~/components/Chat/ChatView";
import type { IThread } from "@justchat/database";

export async function loader({ params }: LoaderFunctionArgs) {
  const { shareId } = params;

  if (!shareId) {
    throw new Response("Share ID is required", { status: 400 });
  }

  const thread = (await chatService.getThreadByShareId(shareId)) as IThread;

  if (!thread) {
    throw new Response("Shared thread not found", { status: 404 });
  }

  const messages = await chatService.getMessages(thread._id.toString());
  const formatted = messages.map((msg: any) => ({
    _id: msg._id.toString(),
    id: msg._id.toString(),
    content: msg.content,
    role: msg.role,
    createdAt: msg.createdAt,
  }));

  return {
    messages: formatted,
    threadId: thread._id.toString(),
    isShared: true,
  };
}

export default function SharedChatPage() {
  const { messages, threadId, isShared } = useLoaderData<typeof loader>();

  return (
    <ChatView
      initialMessages={messages}
      threadId={threadId}
      isShared={isShared}
    />
  );
}
