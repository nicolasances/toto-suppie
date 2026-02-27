"use client";

import { createContext, ReactNode, useContext, useState } from "react";

interface ChatModeContextContent {
  chatMode: boolean;
  setChatMode: (chatMode: boolean) => void;
  toggleChatMode: () => void;
}

const ChatModeContext = createContext<ChatModeContextContent | undefined>(undefined);

interface ChatModeContextProviderProps {
  children: ReactNode;
}

export const ChatModeContextProvider: React.FC<ChatModeContextProviderProps> = ({ children }) => {
  const [chatMode, setChatMode] = useState(false);

  const toggleChatMode = () => {
    setChatMode(!chatMode);
  };

  return (
    <ChatModeContext.Provider value={{ chatMode, setChatMode, toggleChatMode }}>
      {children}
    </ChatModeContext.Provider>
  );
};

export const useChatMode = (): ChatModeContextContent => {
  const context = useContext(ChatModeContext);
  if (!context) {
    throw new Error("useChatMode must be used within a ChatModeContextProvider");
  }
  return context;
};
