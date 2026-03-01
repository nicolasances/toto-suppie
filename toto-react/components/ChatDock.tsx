"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput, { ChatInputHandlers } from "@/toto-react/components/ChatInput";
export interface ChatDockProps {
  sendMessage: (message: string) => void | Promise<void>;
  message?: string;
  onHeightChange: (height: number) => void;
}

export function ChatDock({ sendMessage, message, onHeightChange }: ChatDockProps) {

  const inputRef = useRef<HTMLDivElement>(null);

  const [displayedMessage, setDisplayedMessage] = useState<string | undefined>();
  const [messageVisible, setMessageVisible] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  /**
   * Sends the message to the agent and manages the waiting state
   * @param message 
   */
  const onSendMessage = async (message: string) => {
    setIsWaiting(true);
    await sendMessage(message);
    setIsWaiting(false);
  }

  // Fade-in / fade-out logic for the agent bubble
  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setMessageVisible(true);
    } else {
      setMessageVisible(false);
      const t = setTimeout(() => setDisplayedMessage(undefined), 400);
      return () => clearTimeout(t);
    }
  }, [message]);

  // Report only the chat input section height so the scroll area stays stable
  useEffect(() => {
    if (!inputRef.current) return;

    const element = inputRef.current;
    const updateHeight = () => onHeightChange(Math.ceil(element.getBoundingClientRect().height));

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onHeightChange]);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20" style={{ pointerEvents: "none" }}>
      
      {/* Agent bubble */}
      {displayedMessage && (
        <div
          className="px-3 pb-1"
          style={{
            opacity: messageVisible ? 1 : 0,
            transition: "opacity 0.9s ease",
          }}
        >
          <div className="relative pl-3 pr-10 opacity-90 w-fit">
            <div className="absolute w-2 h-2 top left-1 bg-cyan-400 rounded-full" />
            <div className="text-lg bg-cyan-400 px-4 py-2 rounded-3xl flex">
              {displayedMessage}
            </div>
          </div>
        </div>
      )}

      {/* Waiting indicator */}
      {!displayedMessage && isWaiting && <WaitingIndicator />}

      {/* Chat input */}
      <div
        ref={inputRef}
        className="p-3"
        style={{
          pointerEvents: "auto",
          backgroundColor: "var(--background)",
          borderColor: "var(--foreground-ghost)",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <ChatInput handlers={{ onSendMessage }} />
      </div>
    </div>
  );
}


function WaitingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 pb-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="block w-2 h-2 rounded-full bg-cyan-400"
          style={{
            animation: "bounce 1.2s infinite ease-in-out",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%            { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
