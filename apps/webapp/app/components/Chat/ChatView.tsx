import { useState, useEffect } from "react";
import ChatList from "~/components/Chat/ChatList";
import ChatInput from "~/components/Chat/ChatInput";
import { useChat } from "~/contexts/chat";
import { useNavigate, useLocation } from "react-router";

type Message = {
  _id: string;
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
};

type ChatViewProps = {
  initialMessages: Message[];
  threadId: string;
  userId?: string;
  guestSessionId?: string;
  isShared?: boolean;
};

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export default function ChatView({
  initialMessages,
  threadId,
  userId,
  guestSessionId,
  isShared = false,
}: ChatViewProps) {
  const { updateThread, threads, models } = useChat();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, threadId]);

  useEffect(() => {
    if (!isShared && !threads.some((t) => t._id === threadId)) {
      navigate("/", { replace: true });
    }
  }, [threads, threadId, navigate, isShared]);

  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && initialMessages.length === 0) {
      handleSend(initialMessage.content, initialMessage.model, {
        enableWebSearch: false,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, initialMessages.length]);

  const handleSend = async (
    content: string,
    model: string,
    options: { enableWebSearch: boolean }
  ) => {
    if (isShared) return;

    const userMsg: Message = {
      _id: Date.now().toString(),
      id: Date.now().toString(),
      content,
      role: "user",
      createdAt: new Date().toISOString(),
    };
    setMessages((msgs) => [
      ...msgs,
      userMsg,
      {
        _id: "streaming",
        id: "streaming",
        content: "",
        role: "assistant",
        createdAt: new Date().toISOString(),
      },
    ]);

    let aiContent = "";
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        model,
        userId: userId || undefined,
        content,
        guestSessionId: userId ? undefined : guestSessionId,
        enableWebSearch: options.enableWebSearch,
      }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        setMessages((msgs) =>
          msgs.map((msg) =>
            msg.id === "streaming" ? { ...msg, content: aiContent } : msg
          )
        );
      }
    }

    if (messages.length === 0) {
      updateThread(threadId, { title: content.slice(0, 40) || "New Chat" });
    }

    const assistantMsgId = response.headers.get("X-Assistant-Message-Id");
    if (assistantMsgId && isValidObjectId(assistantMsgId)) {
      setMessages((msgs) =>
        msgs.map((msg) =>
          msg.id === "streaming"
            ? { ...msg, _id: assistantMsgId, id: assistantMsgId }
            : msg
        )
      );
    }
  };

  const handleRetry = async (aiMessageIndex: number, model: string) => {
    if (isShared) return;
    const userMessage = messages[aiMessageIndex - 1];
    const aiMessage = messages[aiMessageIndex];
    if (!userMessage || userMessage.role !== "user") return;

    setMessages((msgs) =>
      msgs.map((msg, idx) =>
        idx === aiMessageIndex
          ? { ...msg, id: "streaming", content: "", role: "assistant" }
          : msg
      )
    );

    let aiContent = "";
    const response = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        threadId,
        model,
        userId: userId || undefined,
        content: userMessage.content,
        guestSessionId: userId ? undefined : guestSessionId,
        assistantMsgId:
          aiMessage && aiMessage._id !== "streaming"
            ? aiMessage._id
            : undefined,
        enableWebSearch: false,
      }),
    });

    if (!response.body) return;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      if (value) {
        const chunk = decoder.decode(value, { stream: true });
        aiContent += chunk;
        setMessages((msgs) =>
          msgs.map((msg, idx) =>
            idx === aiMessageIndex ? { ...msg, content: aiContent } : msg
          )
        );
      }
    }

    const assistantMsgId = response.headers.get("X-Assistant-Message-Id");

    if (assistantMsgId && isValidObjectId(assistantMsgId)) {
      setMessages((msgs) =>
        msgs.map((msg, idx) =>
          idx === aiMessageIndex
            ? { ...msg, _id: assistantMsgId, id: assistantMsgId }
            : msg
        )
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <ChatList
          messages={messages}
          onRetry={handleRetry}
          isShared={isShared}
        />
      </div>
      {!isShared && (
        <div className="p-4 border-t">
          <ChatInput onSend={handleSend} models={models} />
        </div>
      )}
    </div>
  );
}
