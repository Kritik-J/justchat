import { useState, useEffect } from "react";
import ChatInput from "~/components/Chat/ChatInput";
import type { Route } from "./+types/_app._index";
import ChatList from "~/components/Chat/ChatList";
import { useLoaderData } from "react-router";
import { getUserSession } from "~/services/sessionStorage.server";
import { useChat } from "~/contexts/chat";
import { guestSessionClient } from "~/services/guestSession.client";

export function meta({}: Route.MetaArgs) {
  return [{ title: "JustChat" }, { name: "description", content: "JustChat" }];
}

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  _id?: string;
};

export async function loader({ request }: { request: Request }) {
  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  return { userId };
}

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export default function Page() {
  const { userId } = useLoaderData() as { userId?: string };
  const { addThread, models, threads } = useChat();
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      // Use the guest session client
      const sessionId = guestSessionClient.getGuestSessionId();
      setGuestSessionId(sessionId);
    } else {
      setGuestSessionId(null);
    }
    setThreadId(null);
    setMessages([]);
  }, [userId]);

  useEffect(() => {
    if (threadId && !threads.some((t) => t._id === threadId)) {
      setThreadId(null);
      setMessages([]);
    }
  }, [threads, threadId]);

  const handleSend = async (content: string, model: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      content,
      role: "user",
    };
    setMessages((msgs) => [
      ...msgs,
      userMsg,
      { id: "streaming", content: "", role: "assistant" },
    ]);

    let currentThreadId = threadId;
    if (!currentThreadId) {
      // Start a new thread
      const res = await fetch("/chat/start-thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId || undefined,
          guestSessionId: userId ? undefined : guestSessionId,
          title: content.slice(0, 40) || "New Chat",
        }),
      });
      const data = await res.json();
      currentThreadId = data.threadId;
      setThreadId(currentThreadId);

      // Add the new thread to context
      if (currentThreadId) {
        addThread({
          _id: currentThreadId,
          title: content.slice(0, 40) || "New Chat",
        });
      }
    }

    // Stream assistant response
    let aiContent = "";
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId: currentThreadId,
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
            msg.id === "streaming" ? { ...msg, content: aiContent } : msg
          )
        );
      }
    }

    const assistantMsgId = response.headers.get("X-Assistant-Message-Id");

    setMessages((msgs) =>
      msgs.map((msg) =>
        msg.id === "streaming"
          ? {
              ...msg,
              id:
                assistantMsgId && isValidObjectId(assistantMsgId)
                  ? assistantMsgId
                  : Date.now().toString(),
              _id:
                assistantMsgId && isValidObjectId(assistantMsgId)
                  ? assistantMsgId
                  : undefined,
            }
          : msg
      )
    );
  };

  const handleRetry = async (aiMessageIndex: number, model: string) => {
    const userMessage = messages[aiMessageIndex - 1];
    const aiMessage = messages[aiMessageIndex];
    if (!userMessage || userMessage.role !== "user" || !threadId) return;

    setMessages((msgs) =>
      msgs.map((msg, idx) =>
        idx === aiMessageIndex
          ? { ...msg, id: "streaming", content: "", role: "assistant" }
          : msg
      )
    );

    let aiContent = "";
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        model,
        userId: userId || undefined,
        content: userMessage.content,
        guestSessionId: userId ? undefined : guestSessionId,
        assistantMsgId: aiMessage._id,
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
          msgs.map((msg, idx) =>
            idx === aiMessageIndex ? { ...msg, content: aiContent } : msg
          )
        );
      }
    }

    const assistantMsgId = response.headers.get("X-Assistant-Message-Id");

    if (assistantMsgId && isValidObjectId(assistantMsgId)) {
      setMessages((msgs) =>
        msgs.map((msg, idx) =>
          idx === aiMessageIndex
            ? { ...msg, id: assistantMsgId, _id: assistantMsgId }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0 w-full overflow-y-auto pb-12 px-4">
        <ChatList messages={messages} onRetry={handleRetry} />
      </div>

      <div className="sticky bottom-0 bg-background w-full z-10 p-4">
        <ChatInput onSend={handleSend} models={models} />
      </div>
    </div>
  );
}
