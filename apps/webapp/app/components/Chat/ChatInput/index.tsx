import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon } from "@justchat/ui/icons";
import React, { useState } from "react";
import { useFetcher } from "react-router";

interface ChatInputProps {
  onNewMessages: (messages: any[]) => void;
}

export default function ChatInput({ onNewMessages }: ChatInputProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const fetcher = useFetcher();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("message", message);

      fetcher.submit(formData, {
        method: "POST",
        action: "/api/chat",
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle fetcher data changes
  React.useEffect(() => {
    if (fetcher.data?.success && fetcher.data?.messages) {
      onNewMessages(fetcher.data.messages);
    }
  }, [fetcher.data]);

  return (
    <form
      onSubmit={handleSubmit}
      className="h-full w-full flex flex-col gap-2 border border-border rounded-md p-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]"
    >
      <textarea
        name="message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder="Ask me anything..."
        disabled={isLoading}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={isLoading}
          >
            <Paperclip className="size-4" />
          </Button>

          <Button type="submit" size="icon-sm" disabled={isLoading}>
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </form>
  );
}
