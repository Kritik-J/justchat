import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
  onRetry: (model: string) => Promise<void>;
}

export default function ChatMessage({ message, onRetry }: ChatMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  return <AIMessage message={message} onRetry={onRetry} />;
}
