import { useState } from "react";
import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon } from "@justchat/ui/icons";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@justchat/ui/components/select";

const models = [
  { id: "gemma2-9b-it", label: "Gemma 2 9B (Google)" },
  { id: "meta-llama/llama-guard-4-12b", label: "Llama Guard 4 12B (Meta)" },
  { id: "llama-3.3-70b-versatile", label: "Llama 3.3 70B Versatile (Meta)" },
  { id: "llama-3.1-8b-instant", label: "Llama 3.1 8B Instant (Meta)" },
];

export default function ChatInput({
  onSend,
}: {
  onSend: (input: string, model: string) => void;
}) {
  const [selectedModel, setSelectedModel] = useState(models[0].id);
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
      <Select value={selectedModel} onValueChange={setSelectedModel}>
        <SelectTrigger className="w-full mb-2">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <textarea
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder="Ask me anything..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <div className="flex items-center justify-between">
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
