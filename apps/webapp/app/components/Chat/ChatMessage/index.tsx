import AIMessage from "./AIMessage";
import UserMessage from "./UserMessage";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    role: "user" | "assistant";
  };
}

export default function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === "user") {
    return <UserMessage message={message} />;
  }

  return <AIMessage message={message} />;
}
