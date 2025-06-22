import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
  onRetry: (model: string) => Promise<void>;
  isShared: boolean;
}

export default function ChatMessage({
  message,
  onRetry,
  isShared,
}: ChatMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  return <AIMessage message={message} onRetry={onRetry} isShared={isShared} />;
}
