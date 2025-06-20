import { useEffect, useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon } from "@justchat/ui/icons";
import type { ILLM } from "@justchat/database";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@justchat/ui/components/select";

export default function ChatInput({
  onSend,
  models,
}: {
  onSend: (input: string, model: string) => void;
  models: ILLM[];
}) {
  const [selectedModel, setSelectedModel] = useState(models[0].model_name);

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
          <Select value={selectedModel} onValueChange={setSelectedModel}>
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
