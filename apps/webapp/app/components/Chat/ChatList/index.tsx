import React, { useEffect, useRef } from "react";
import ChatMessage from "../ChatMessage";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

interface ChatListProps {
  messages: Message[];
  onRetry: (messageIndex: number, model: string) => Promise<void>;
  isShared: boolean;
}

export default function ChatList({
  messages,
  onRetry,
  isShared,
}: ChatListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div ref={containerRef} className="flex flex-col gap-2 p-4">
      {messages.map((message, idx) => (
        <div
          key={message.id}
          ref={idx === messages.length - 1 ? lastMessageRef : undefined}
        >
          <ChatMessage
            message={message}
            onRetry={(model) => onRetry(idx, model)}
            isShared={isShared}
          />
        </div>
      ))}
    </div>
  );
}
