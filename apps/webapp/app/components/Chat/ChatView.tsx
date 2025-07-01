import { useState, useEffect } from "react";
import ChatList from "~/components/Chat/ChatList";
import ChatInput from "~/components/Chat/ChatInput";
import { useChat } from "~/contexts/chat";
import { useNavigate, useLocation } from "react-router";
import { Button } from "@justchat/ui/components/button";
import { GitFork } from "@justchat/ui/icons";
import { toast } from "@justchat/ui/components/sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@justchat/ui/components/tooltip";

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
  shareId?: string;
  threadTitle?: string;
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
  shareId,
  threadTitle,
}: ChatViewProps) {
  const { updateThread, threads, models, forkThread } = useChat();
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
        enableRAG: false,
      });
      window.history.replaceState({}, document.title);
    }
  }, [location.state, initialMessages.length]);

  const handleFork = async () => {
    if (!shareId) {
      toast.error("Unable to fork: No share ID available");
      return;
    }

    const newThreadId = await forkThread(shareId, threadTitle);
    if (newThreadId) {
      navigate(`/chat/${newThreadId}`);
    }
  };

  const handleSend = async (
    content: string,
    model: string,
    options: { enableWebSearch: boolean; enableRAG: boolean }
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
        enableRAG: options.enableRAG,
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
      {isShared && (
        <div className="flex justify-center mb-4">
          <div className="flex items-center gap-3 p-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-700/50 rounded-full border border-gray-200 dark:border-gray-600 shadow-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleFork}
                    size="sm"
                    className="h-8 w-8 p-0 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black shadow-md hover:shadow-lg transition-all duration-200 rounded-full border-0"
                  >
                    <GitFork />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fork this chat to create your own copy</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      )}
      <div className="p-4 border-t">
        <ChatInput onSend={handleSend} models={models} isShared={isShared} />
      </div>
    </div>
  );
}
