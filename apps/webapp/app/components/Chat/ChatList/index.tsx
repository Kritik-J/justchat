import React, { useState, useEffect } from "react";
import ChatMessage from "../ChatMessage";
import { useLoaderData } from "react-router";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
}

export default function ChatList({ messages }: { messages: any }) {
  return (
    <div className="flex flex-col gap-2">
      {messages.documents.map((message: any) => (
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
