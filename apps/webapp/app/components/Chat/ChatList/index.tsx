import React, { useEffect, useRef } from "react";
import ChatMessage from "../ChatMessage";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function ChatList({ messages }: { messages: Message[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div
      ref={containerRef}
      className="flex flex-col gap-2 h-full overflow-y-auto"
    >
      {messages.map((message, idx) => (
        <div
          key={message.id}
          ref={idx === messages.length - 1 ? lastMessageRef : undefined}
        >
          <ChatMessage message={message} />
        </div>
      ))}
    </div>
  );
}
