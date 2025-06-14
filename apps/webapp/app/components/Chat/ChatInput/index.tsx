import { Button } from "@justchat/ui/components/button";
import { Paperclip, SendIcon } from "@justchat/ui/icons";

export default function ChatInput() {
  return (
    <div className="h-full w-full flex flex-col gap-2 border border-border rounded-md p-2 focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]">
      <textarea
        className="w-full h-full resize-none text-sm border-none outline-none"
        placeholder="Ask me anything..."
        onKeyDown={(e) => {}}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon-sm">
            <Paperclip className="size-4" />
          </Button>

          <Button size="icon-sm">
            <SendIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
