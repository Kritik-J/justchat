import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon, Search, Globe } from "@justchat/ui/icons";
import type { ILLM } from "@justchat/database";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@justchat/ui/components/select";
import { useChat } from "~/contexts/chat";

export default function ChatInput({
  onSend,
  models,
}: {
  onSend: (
    input: string,
    model: string,
    options: { enableWebSearch: boolean }
  ) => void;
  models: ILLM[];
}) {
  const { activeModel, setActiveModel } = useChat();
  const [input, setInput] = useState("");
  const [enableWebSearch, setEnableWebSearch] = useState(false);

  const handleSend = () => {
    if (input.trim()) {
      onSend(input, activeModel?.model_name!, { enableWebSearch });
      setInput("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleWebSearch = () => {
    setEnableWebSearch(!enableWebSearch);
  };

  return (
    <div className="h-full w-full flex flex-col gap-2 border border-border rounded-md p-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      <textarea
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder={
          enableWebSearch
            ? "Ask me anything... (Web search enabled)"
            : "Ask me anything..."
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      {/* Web search indicator */}
      {enableWebSearch && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded">
          <Search className="size-3" />
          <span>Web search enabled</span>
        </div>
      )}

      <div className="flex items-center justify-between">
        {models.length > 0 && (
          <Select
            value={activeModel?.model_name}
            onValueChange={(value) =>
              setActiveModel(models.find((m) => m.model_name === value)!)
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model, index) => (
                <SelectItem key={index} value={model.model_name}>
                  {model.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleWebSearch}
            className={
              enableWebSearch
                ? "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700"
                : ""
            }
            title={enableWebSearch ? "Disable web search" : "Enable web search"}
          >
            <Globe
              className={`size-4 ${enableWebSearch ? "text-blue-600 dark:text-blue-400" : ""}`}
            />
          </Button>
          <Button variant="outline" size="icon-sm">
            <Paperclip className="size-4" />
          </Button>
          <Button size="sm" onClick={handleSend}>
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
