import { useLoaderData } from "react-router";
import { useState, useEffect } from "react";
import { chatService } from "~/services/chat.server";
import ChatList from "~/components/Chat/ChatList";
import ChatInput from "~/components/Chat/ChatInput";
import { getUserSession } from "~/services/sessionStorage.server";
import type { LoaderFunctionArgs } from "react-router";
import { useChat } from "~/contexts/chat";
import { redirect, useNavigate, useLocation } from "react-router";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const threadId = params.id;
  if (!threadId) throw new Response("Thread ID required", { status: 400 });

  const thread = await chatService.getThread(threadId);
  if (!thread) {
    throw redirect("/");
  }

  const session = await getUserSession(request);
  const userId = session.get("userId") as string | undefined;
  let guestSessionId: string | undefined = undefined;

  const messages = await chatService.getMessages(threadId);
  const formatted = messages.map((msg: any) => ({
    _id: msg._id.toString(),
    id: msg._id.toString(),
    content: msg.content,
    role: msg.role,
    createdAt: msg.createdAt,
  }));
  return { messages: formatted, threadId, userId, guestSessionId };
}

type Message = {
  _id: string;
  id: string;
  content: string;
  role: "user" | "assistant";
  createdAt: string;
};

function isValidObjectId(id: string) {
  return typeof id === "string" && /^[a-f\d]{24}$/i.test(id);
}

export default function Page() {
  const {
    messages: initialMessages,
    threadId,
    userId,
    guestSessionId,
  } = useLoaderData() as {
    messages: Message[];
    threadId: string;
    userId?: string;
    guestSessionId?: string;
  };

  const { updateThread, models, threads } = useChat();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync messages state with loader data when threadId changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages, threadId]);

  // Redirect if thread is deleted
  useEffect(() => {
    if (!threads.some((t) => t._id === threadId)) {
      navigate("/", { replace: true });
    }
  }, [threads, threadId, navigate]);

  // Handle the initial message passed from the homepage
  useEffect(() => {
    const initialMessage = location.state?.initialMessage;
    if (initialMessage && initialMessages.length === 0) {
      handleSend(initialMessage.content, initialMessage.model);
      // Clear the state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, initialMessages.length]);

  const handleSend = async (content: string, model: string) => {
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

    // Stream assistant response
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

    // Update thread title with first message if it's a new thread
    if (messages.length === 0) {
      updateThread(threadId, { title: content.slice(0, 40) || "New Chat" });
    }

    // Optionally, replace the "streaming" id with a real id after completion
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

  // Add retry handler
  const handleRetry = async (aiMessageIndex: number, model: string) => {
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
            ? { ...msg, id: assistantMsgId, _id: assistantMsgId }
            : msg
        )
      );
    }
  };
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0 w-full overflow-y-auto pb-12 px-4">
        <ChatList messages={messages} onRetry={handleRetry} />
      </div>
      <div className="sticky bottom-0 w-full bg-background z-10 p-4">
        <ChatInput onSend={handleSend} models={models} />
      </div>
    </div>
  );
}
