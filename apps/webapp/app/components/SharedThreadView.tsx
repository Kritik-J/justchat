import { useLoaderData } from "react-router";
import ChatList from "~/components/Chat/ChatList";
import { ShareIcon } from "@justchat/ui/icons";

type LoaderData = {
  thread: {
    _id: string;
    title: string;
    shareId: string;
  };
  messages: Array<{
    _id: string;
    id: string;
    content: string;
    role: "user" | "assistant";
    createdAt: string;
  }>;
};

export function SharedThreadView() {
  const { thread, messages } = useLoaderData<LoaderData>();

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <ShareIcon className="h-5 w-5 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Shared Thread</h1>
      </div>

      {/* Thread Title */}
      <div className="px-4 py-2 bg-muted/50">
        <h2 className="text-sm font-medium text-muted-foreground">
          {thread.title || "Untitled Thread"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <ChatList
          messages={messages}
          onRetry={async () => {
            // No-op for read-only view
          }}
        />
      </div>

      {/* Disabled Input */}
      <div className="p-4 border-t bg-muted/20">
        <div className="flex items-center gap-2 p-3 bg-background border rounded-lg">
          <div className="flex-1 text-sm text-muted-foreground">
            This is a shared thread in read-only mode
          </div>
        </div>
      </div>
    </div>
  );
}
