import { createContext, useContext, useState } from "react";
import type { ILLM } from "@justchat/database";
import { toast } from "@justchat/ui/components/sonner";

export type Thread = {
  _id: string;
  title?: string;
  shareId?: string;
};

export const ChatContext = createContext({
  models: [] as ILLM[],
  activeModel: null as ILLM | null,
  setActiveModel: (model: ILLM) => {},
  threads: [] as Thread[],
  setThreads: (threads: Thread[]) => {},
  addThread: (thread: Thread) => {},
  updateThread: (threadId: string, updates: Partial<Thread>) => {},
  removeThread: (threadId: string) => {},
  shareThread: async (threadId: string): Promise<string | null> => null,
  forkThread: async (shareId: string, title?: string): Promise<string | null> =>
    null,
});

export const ChatProvider = ({
  children,
  models,
  initialThreads = [],
}: {
  children: React.ReactNode;
  models: ILLM[];
  initialThreads?: Thread[];
}) => {
  const [activeModel, setActiveModel] = useState<ILLM | null>(
    models[0] || null
  );
  const [threads, setThreads] = useState<Thread[]>(initialThreads);

  const addThread = (thread: Thread) => {
    setThreads((current) => [thread, ...current]);
  };

  const updateThread = async (threadId: string, updates: Partial<Thread>) => {
    const res = await fetch("/chat/update-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId, updates }),
    });
    if (res.ok) {
      setThreads((current) =>
        current.map((t) => (t._id === threadId ? { ...t, ...updates } : t))
      );
    } else {
      toast.error("Failed to update thread");
    }
  };

  const removeThread = async (threadId: string) => {
    const res = await fetch("/chat/delete-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId }),
    });
    if (res.ok) {
      setThreads((current) => current.filter((t) => t._id !== threadId));
    } else {
      toast.error("Failed to delete thread");
    }
  };

  const shareThread = async (threadId: string): Promise<string | null> => {
    const res = await fetch("/chat/share-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ threadId }),
    });
    if (res.ok) {
      const { shareId } = await res.json();
      setThreads((current) =>
        current.map((t) => (t._id === threadId ? { ...t, shareId } : t))
      );
      return shareId;
    } else {
      toast.error("Failed to share thread");
      return null;
    }
  };

  const forkThread = async (
    shareId: string,
    title?: string
  ): Promise<string | null> => {
    const res = await fetch("/chat/fork-thread", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId, title }),
    });
    if (res.ok) {
      const { threadId } = await res.json();
      // Add the new forked thread to the threads list
      const newThread: Thread = {
        _id: threadId,
        title: title || "Forked Thread",
      };
      addThread(newThread);
      toast.success("Thread forked successfully!");
      return threadId;
    } else {
      const error = await res.json();
      toast.error(error.error || "Failed to fork thread");
      return null;
    }
  };

  return (
    <ChatContext.Provider
      value={{
        models,
        activeModel,
        setActiveModel,
        threads,
        setThreads,
        addThread,
        updateThread,
        removeThread,
        shareThread,
        forkThread,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
