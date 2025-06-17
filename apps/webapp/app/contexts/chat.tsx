import { createContext, useContext, useState } from "react";
import type { ILLM } from "@justchat/database";

export const ChatContext = createContext({
  models: [] as ILLM[],
  activeModel: null as ILLM | null,
  setActiveModel: (model: ILLM) => {},
});

export const ChatProvider = ({
  children,
  models,
}: {
  children: React.ReactNode;
  models: ILLM[];
}) => {
  const [activeModel, setActiveModel] = useState<ILLM | null>(
    models[0] || null
  );

  return (
    <ChatContext.Provider
      value={{
        models,
        activeModel,
        setActiveModel,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  return useContext(ChatContext);
};
