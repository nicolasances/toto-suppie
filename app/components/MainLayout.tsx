"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem, SideMenuToggleableItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider, useCarMode } from "@/toto-react/context/CarModeContext";
import { ChatModeContextProvider, useChatMode } from "@/context/ChatModeContext";
import ChatInput, { ChatInputHandlers } from "@/toto-react/components/ChatInput";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <CarModeContextProvider>
      <ChatModeContextProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </ChatModeContextProvider>
    </CarModeContextProvider>
  );
}

interface MainLayoutContentProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutContentProps) {
  const router = useRouter();
  const { carMode, toggleCarMode } = useCarMode();
  const { chatMode, toggleChatMode } = useChatMode();

  const menuItems = useMemo<SideMenuItem[]>(
    () => [
      { id: "home", label: "Home", iconPath: "/images/home.svg", closeOnClick: true, onClick: () => router.push("/") },
    ],
    [router],
  );

  const toggleableItems = useMemo<SideMenuToggleableItem[]>(
    () => [
      { id: "chat-mode", label: "Chat Mode", iconPath: "/images/chat.svg", iconAlt: "Chat", isActive: chatMode, onClick: toggleChatMode },
      { id: "car-mode", label: "Car Mode", iconPath: "/images/car.svg", iconAlt: "Car mode", isActive: carMode, onClick: toggleCarMode },
    ],
    [chatMode, toggleChatMode, carMode, toggleCarMode],
  );

  const chatInputHandlers = useMemo<ChatInputHandlers>(
    () => ({
      onSendMessage: async (message: string) => {
        console.log("Sending chat message:", message);
      },
    }),
    [],
  );

  return (
    <>
      <SideMenu items={menuItems} toggleableItems={toggleableItems} />
      <AuthWrapper>
        <div className={chatMode ? "pb-24" : ""}>{children}</div>
        {chatMode && <ChatInput handlers={chatInputHandlers} />}
      </AuthWrapper>
    </>
  );
}
