"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem, SideMenuToggleableItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider, useCarMode } from "@/toto-react/context/CarModeContext";
import { ChatModeContextProvider, useChatMode } from "@/context/ChatModeContext";
import { ChatInputHandlers } from "@/toto-react/components/ChatInput";
import { ChatDock } from "@/toto-react/components/ChatDock";
import { AgentBubble } from "@/toto-react/components/AgentBubble";

import { HeaderProvider } from "@/context/HeaderContext";
import AppHeader from "./AppHeader";
import { SuppieAgent } from "@/api/SupermarketAgent";
import { SupermarketAPI } from "@/api/SupermarketAPI";
import { WaitingForAgent } from "@/toto-react/components/WaitingForAgent";

interface MainLayoutProps {
  children: React.ReactNode;
}

interface SSEMessage {
  event: string;
  data: any;
  receivedAt: string;
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

  const [sseMessages, setSseMessages] = useState<SSEMessage[]>([{ event: "message", receivedAt: new Date().toISOString(), data: { message: "Hello" } }]);
  const [sseActive, setSseActive] = useState(false);
  const [sendingMessage, setSendingMessage] = useState<boolean>(false);
  const [chatDockHeightPx, setChatDockHeightPx] = useState(CHAT_DOCK_HEIGHT_PX);
  const [visibleMessage, setVisibleMessage] = useState<string | undefined>(undefined);

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
      /**
       * Chat with Suppie Agent
       * @param message 
       */
      onSendMessage: async (message: string) => {

        setSendingMessage(true);

        const { conversationId } = await new SuppieAgent().postMessage(message);

        openSseStream(conversationId);

      },
    }),
    [],
  );

  const openSseStream = async (chatConversationId: string) => {
    setSseMessages([]);
    setSseActive(true);

    try {
      const response = await new SupermarketAPI().streamConversationStatus(chatConversationId);
      const reader = response.body?.getReader();
      if (!reader) { setSseActive(false); return; }

      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = 'message';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {

          if (line.startsWith('event:')) {
            currentEvent = line.slice(6).trim();
          }
          else if (line.startsWith('data:')) {

            const raw = line.slice(5).trim();

            let data: unknown = raw;

            try { data = JSON.parse(raw); } catch { /* keep raw string */ }

            // Skip "done" events - only consider "message" events
            if (currentEvent == 'message') setSseMessages(prev => [...prev, { event: currentEvent, data, receivedAt: new Date().toISOString() }]);

            currentEvent = 'message';

          }
        }
      }
    } catch (err) {
      setSseMessages(prev => [...prev, { event: 'error', data: String(err), receivedAt: new Date().toISOString() }]);
    } finally {
      setSseActive(false);
    }
  };

  useEffect(() => {

    const last = sseMessages?.[sseMessages.length - 1]?.data?.message;
    
    if (!last) return;
    
    setVisibleMessage(last);
    
    const t = setTimeout(() => setVisibleMessage(undefined), 5000);
    
    return () => clearTimeout(t);

  }, [sseMessages]);

  return (
    <>
      <SideMenu items={menuItems} toggleableItems={toggleableItems} />
      <AuthWrapper>
        <HeaderProvider>
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
        </HeaderProvider>
        {chatMode && (
          <>
            <AgentBubble message={visibleMessage} bottomOffset={chatDockHeightPx} />
            {sendingMessage && <WaitingForAgent bottomOffset={chatDockHeightPx} />}
            <ChatDock
              chatInputHandlers={chatInputHandlers}
              onHeightChange={setChatDockHeightPx}
            />
          </>
        )}
      </AuthWrapper>
    </>
  );
}


