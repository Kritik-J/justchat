import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@justchat/ui/components/avatar";
import React from "react";

export default function AIMessage({
  message,
}: {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
}) {
  return (
    <div className="flex flex-col w-full justify-start p-4 gap-2">
      <div className="flex items-center gap-2">
        <Avatar className="rounded-sm">
          <AvatarImage src="https://github.com/Kritik-J.png" />
          <AvatarFallback>K</AvatarFallback>
        </Avatar>

        <span className="text-sm font-medium text-muted-foreground">
          Assistant
        </span>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none">
        {message.content}
      </div>
    </div>
  );
}
