import React, { useEffect, useRef, useState } from "react";
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
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const [prevMessagesLength, setPrevMessagesLength] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Wrap onRetry to track retry state
  const handleRetry = async (messageIndex: number, model: string) => {
    setIsRetrying(true);
    try {
      await onRetry(messageIndex, model);
    } finally {
      // Add a small delay before allowing auto-scroll again
      // This prevents scroll during streaming updates after retry
      setTimeout(() => {
        setIsRetrying(false);
      }, 500);
    }
  };

  useEffect(() => {
    const messagesIncreased = messages.length > prevMessagesLength;

    // Only auto-scroll if:
    // 1. Messages length increased (new message added)
    // 2. Not currently retrying a message
    const shouldScroll = messagesIncreased && !isRetrying;

    if (shouldScroll && lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }

    setPrevMessagesLength(messages.length);
  }, [messages.length, isRetrying, prevMessagesLength]);

  return (
    <div className="flex flex-col gap-2 p-4">
      {messages.map((message, idx) => (
        <div
          key={message.id}
          ref={idx === messages.length - 1 ? lastMessageRef : undefined}
        >
          <ChatMessage
            message={message}
            onRetry={(model) => handleRetry(idx, model)}
            isShared={isShared}
          />
        </div>
      ))}
    </div>
  );
}
