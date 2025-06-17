import { useState, useEffect } from "react";
import ChatInput from "~/components/Chat/ChatInput";
import type { Route } from "./+types/_app._index";
import ChatList from "~/components/Chat/ChatList";
import { useLoaderData } from "react-router";
import { getUserSession } from "~/services/sessionStorage.server";

export function meta({}: Route.MetaArgs) {
  return [{ title: "JustChat" }, { name: "description", content: "JustChat" }];
}

type Message = { id: string; content: string; role: "user" | "assistant" };

export async function loader({ request }: { request: Request }) {
  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  return { userId };
}

export default function Page() {
  const { userId } = useLoaderData() as { userId?: string };
  const [messages, setMessages] = useState<Message[]>([]);
  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      let guestId = localStorage.getItem("guestSessionId");
      if (!guestId) {
        guestId = crypto.randomUUID();
        localStorage.setItem("guestSessionId", guestId);
      }
      setGuestSessionId(guestId);
    } else {
      setGuestSessionId(null);
    }
    setThreadId(null); // Reset threadId on user change
    setMessages([]); // Optionally reset messages on user change
  }, [userId]);

  // Handler to send a message and stream the response
  const handleSend = async (content: string, model: string) => {
    // Add user message
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
          userId: userId || "guest",
          title: content.slice(0, 40) || "New Chat",
        }),
      });
      const data = await res.json();
      currentThreadId = data.threadId;
      setThreadId(currentThreadId);
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

    // Optionally, replace the "streaming" id with a real id after completion
    setMessages((msgs) =>
      msgs.map((msg) =>
        msg.id === "streaming" ? { ...msg, id: Date.now().toString() } : msg
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
