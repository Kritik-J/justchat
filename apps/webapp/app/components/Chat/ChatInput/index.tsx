import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon } from "@justchat/ui/icons";
import type { ILLM } from "@justchat/database";

export default function ChatInput({
  onSend,
  models,
}: {
  onSend: (input: string, model: string) => void;
  models: ILLM[];
}) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o");

  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim()) {
      onSend(input, selectedModel);
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 border border-border rounded-md p-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      <textarea
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder="Ask me anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="flex items-center justify-between">
        {models.length > 0 && (
          <select
            className="border border-border bg-background text-foreground rounded-md px-3 py-2 text-sm shadow-xs outline-none focus:border-ring focus:ring-2 focus:ring-ring/50 transition-colors duration-150 min-w-[12rem] hover:bg-accent/30"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
          >
            {models.map((model, index) => (
              <option
                key={index}
                value={model.model_name}
                className="bg-background text-foreground"
              >
                {model.name}
              </option>
            ))}
          </select>
        )}

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm">
            <Paperclip className="size-4" />
          </Button>
          <Button size="icon-sm" onClick={handleSend}>
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
