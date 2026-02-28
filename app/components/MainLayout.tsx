"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthWrapper } from "./AuthWrapper";
import SideMenu, { SideMenuItem, SideMenuToggleableItem } from "@/app/ui/SideMenu";
import { CarModeContextProvider, useCarMode } from "@/toto-react/context/CarModeContext";
import { ChatModeContextProvider, useChatMode } from "@/context/ChatModeContext";
import ChatInput, { ChatInputHandlers } from "@/toto-react/components/ChatInput";
import { HeaderProvider } from "@/context/HeaderContext";
import AppHeader from "./AppHeader";
import { SuppieAgent } from "@/api/SupermarketAgent";
import { SupermarketAPI } from "@/api/SupermarketAPI";

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

  const [sseMessages, setSseMessages] = useState<SSEMessage[]>([{ event: "message", receivedAt: new Date().toISOString(), data: { message: "Hello!" } }]);
  const [sseActive, setSseActive] = useState(false);
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

  const chatInputHandlers = useMemo<ChatInputHandlers>(
    () => ({
      /**
       * Chat with Suppie Agent
       * @param message 
       */
      onSendMessage: async (message: string) => {

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
          <ChatDock
            message={sseMessages?.[sseMessages.length - 1]?.data?.message}
            chatInputHandlers={chatInputHandlers}
            onHeightChange={setChatDockHeightPx}
          />
        )}
      </AuthWrapper>
    </>
  );
}

function ChatDock({
  message,
  chatInputHandlers,
  onHeightChange,
}: {
  message?: string;
  chatInputHandlers: ChatInputHandlers;
  onHeightChange: (height: number) => void;
}) {
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dockRef.current) {
      return;
    }

    const element = dockRef.current;
    const updateHeight = () => onHeightChange(Math.ceil(element.getBoundingClientRect().height));

    updateHeight();

    const observer = new ResizeObserver(() => {
      updateHeight();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [message, onHeightChange]);

  return (
    <div
      ref={dockRef}
      className="fixed bottom-0 left-0 right-0 z-20 p-3"
      style={{
        backgroundColor: "var(--background)",
        borderColor: "var(--foreground-ghost)",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
      }}
    >
      <div className="mb-4">
        {message && <AgentMessage message={message} />}
      </div>
      <ChatInput handlers={chatInputHandlers} />
    </div>
  );
}

function AgentMessage({ message }: { message: string }) {

  return (
    <div className="relative pl-3 pr-10">
      <div className="absolute w-2 h-2 top left-1 bg-cyan-400 rounded-full"></div>
      <div className="absolute w-4 h-4 top left-2 bg-cyan-400 rounded-full"></div>
      <div className="text-lg bg-cyan-400 px-4 py-2 rounded-3xl">
        {message}
      </div>
    </div>
  )
}