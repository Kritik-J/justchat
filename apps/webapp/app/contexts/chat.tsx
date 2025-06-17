import { createContext, useContext, useState } from "react";
import type { ILLM } from "@justchat/database";

type Thread = {
  _id: string;
  title?: string;
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

  const updateThread = (threadId: string, updates: Partial<Thread>) => {
    setThreads((current) =>
      current.map((t) => (t._id === threadId ? { ...t, ...updates } : t))
    );
  };

  const removeThread = (threadId: string) => {
    setThreads((current) => current.filter((t) => t._id !== threadId));
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
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
