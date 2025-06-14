import React from "react";

export default function UserMessage({
  message,
}: {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
}) {
  return (
    <div className="flex w-full justify-end p-4">
      <div className="rounded-lg border bg-card p-4">{message.content}</div>
    </div>
  );
}
