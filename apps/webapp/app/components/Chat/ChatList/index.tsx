import React from "react";
import ChatMessage from "../ChatMessage";

export default function ChatList() {
  return (
    <div className="flex flex-col gap-2">
      {MESSAGES.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
}

const MESSAGES = [
  {
    id: "1",
    content: "Hello, how are you?",
    role: "user",
  },
  {
    id: "2",
    content: "I'm fine, thank you!",
    role: "assistant",
  },
  {
    id: "3",
    content: "What is the capital of France?",
    role: "user",
  },
  {
    id: "4",
    content: "Paris",
    role: "assistant",
  },
] as const;
