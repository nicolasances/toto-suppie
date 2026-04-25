"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem, SideMenuToggleableItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider, useCarMode } from "@/toto-react/context/CarModeContext";
import { ChatModeContextProvider, useChatMode } from "@/context/ChatModeContext";
import { ChatDock } from "@/toto-react/components/ChatDock";

import { HeaderProvider } from "@/context/HeaderContext";
import { AudioProvider } from "@/toto-react/context/AudioContext";
import AppHeader from "./AppHeader";
import { SuppieAgent } from "@/api/SupermarketAgent";
import { GaleBrokerAPI } from "@/toto-react/api/GaleBrokerAPI";

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

const HEADER_HEIGHT_PX = 64;
const CHAT_DOCK_HEIGHT_PX = 96;

function MainLayoutContent({ children }: MainLayoutContentProps) {
  const router = useRouter();
  const { carMode, toggleCarMode } = useCarMode();
  const { chatMode, toggleChatMode } = useChatMode();

  const [chatDockHeightPx, setChatDockHeightPx] = useState(CHAT_DOCK_HEIGHT_PX);

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

  const sendMessage = async (message: string): Promise<string> => {

    const { conversationId } = await new SuppieAgent().postMessage(message);

    return conversationId;

  }

  return (
    <>
      <SideMenu items={menuItems} toggleableItems={toggleableItems} />
      <AuthWrapper>
        <HeaderProvider>
          <AudioProvider>
          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute left-0 right-0 top-0" style={{ height: `${HEADER_HEIGHT_PX}px` }}>
              <AppHeader />
            </div>
            <div
              className="absolute left-0 right-0 overflow-y-auto"
              style={{
                top: `${HEADER_HEIGHT_PX}px`,
                bottom: chatMode ? `${chatDockHeightPx}px` : "0px",
              }}
            >
              {children}
            </div>
          </div>
          </AudioProvider>
        </HeaderProvider>
        {chatMode && (
          <ChatDock
            sendMessage={sendMessage}
            streamConversationStatus={async (chatConversationId: string) => { return await new GaleBrokerAPI().streamConversationStatus(chatConversationId); }}
            onHeightChange={setChatDockHeightPx}
          />
        )}
      </AuthWrapper>
    </>
  );
}


