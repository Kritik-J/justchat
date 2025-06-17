import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { chatService } from "~/services/chat.server";
import ChatList from "~/components/Chat/ChatList";
import ChatInput from "~/components/Chat/ChatInput";
import { getUserSession } from "~/services/sessionStorage.server";
import type { LoaderFunctionArgs } from "react-router";

// Loader to fetch messages for the thread
export async function loader({ params, request }: LoaderFunctionArgs) {
  const threadId = params.id;
  if (!threadId) throw new Response("Thread ID required", { status: 400 });

  // Optionally, get userId for guest session support
  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  let guestSessionId: string | undefined = undefined;

  const messages = await chatService.getMessages(threadId);
  const formatted = messages.map((msg: any) => ({
    _id: msg._id.toString(),
    id: msg._id.toString(),
    content: msg.content,
    role: msg.role,
    createdAt: msg.createdAt,
  }));
  return { messages: formatted, threadId, userId, guestSessionId };
}

type Message = {
  _id: string;
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
};

export default function Page() {
  const {
    messages: initialMessages,
    threadId,
    userId,
    guestSessionId,
  } = useLoaderData() as {
    messages: Message[];
    threadId: string;
    userId?: string;
    guestSessionId?: string;
  };

  const [messages, setMessages] = useState<Message[]>(initialMessages);

  // Sync messages state with loader data when threadId changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, threadId]);

  // Handler to send a message and stream the response
  const handleSend = async (content: string, model: string) => {
    // Add user message
    const userMsg: Message = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      content,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    setMessages((msgs) => [
      ...msgs,
      userMsg,
      {
        _id: "streaming",
        id: "streaming",
        content: "",
        role: "assistant",
        createdAt: new Date().toISOString(),
      },
    ]);

    // Stream assistant response
    let aiContent = "";
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        model,
        userId: userId || undefined,
        content,
        guestSessionId: userId ? undefined : guestSessionId,
      }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg._id === "streaming" ? { ...msg, content: aiContent } : msg
          )
        );
      }
    }

    // Optionally, replace the "streaming" id with a real id after completion
    setMessages((msgs) =>
      msgs.map((msg) =>
        msg._id === "streaming"
          ? { ...msg, _id: Date.now().toString(), id: Date.now().toString() }
          : msg
      )
    );
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0 w-full overflow-y-auto pb-12 px-4">
        <ChatList messages={messages} />
      </div>
      <div className="sticky bottom-3 w-full bg-background z-10 p-4">
        <ChatInput onSend={handleSend} />
      </div>
    </div>
  );
}
