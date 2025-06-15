import React, { useState } from "react";
import ChatInput from "~/components/Chat/ChatInput";
import ChatList from "~/components/Chat/ChatList";
import { messageService } from "~/services/db/message.server";
import { getUserSession } from "~/services/sessionStorage.server";
import { useLoaderData } from "react-router";

export async function loader({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const user = await getUserSession(request);
  const messages = await messageService.findAll({
    chatId: params.id,
    userId: user.id,
  });

  return { messages };
}

export default function Page() {
  const { messages: initialMessages } = useLoaderData<typeof loader>();
  const [messages, setMessages] = useState(initialMessages);

  const handleNewMessages = (newMessages: any[]) => {
    setMessages((prev) => ({
      documents: [...prev.documents, ...newMessages],
      page_stat: prev.page_stat,
    }));
  };

  return (
    <div className="p-4 h-full w-full grid grid-rows-[1fr_auto]">
      <ChatList messages={messages} />
      <ChatInput onNewMessages={handleNewMessages} />
    </div>
  );
}
