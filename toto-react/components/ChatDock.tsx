"use client";

import { useEffect, useRef, useState } from "react";
import ChatInput, { ChatInputHandlers } from "@/toto-react/components/ChatInput";

export interface ChatDockProps {
  sendMessage: (message: string) => Promise<string>;
  streamConversationStatus?: (chatConversationId: string) => Promise<Response>;
  onHeightChange: (height: number) => void;
}

interface SSEMessage {
  event: string;
  data: any;
  receivedAt: string;
}


export function ChatDock({ sendMessage, streamConversationStatus, onHeightChange }: ChatDockProps) {

  const inputRef = useRef<HTMLDivElement>(null);

  const [displayedMessage, setDisplayedMessage] = useState<string | undefined>();
  const [messageVisible, setMessageVisible] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [sseActive, setSseActive] = useState(false);
  const [sseMessages, setSseMessages] = useState<SSEMessage[]>([{ event: "message", receivedAt: new Date().toISOString(), data: { message: "Hello" } }]);
  const [visibleMessage, setVisibleMessage] = useState<string | undefined>(undefined);

  const openSseStream = async (chatConversationId: string) => {

    if (!streamConversationStatus) return;

    setSseMessages([]);
    setSseActive(true);

    try {
      // Call the handle to get the SSE stream
      const response = await streamConversationStatus(chatConversationId);

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

  /**
   * Sends the message to the agent and manages the waiting state. 
   * Also, starts listening to the SSE stream for the conversation status if the streamConversationStatus function is provided.
   * @param message 
   */
  const onSendMessage = async (message: string) => {

    setIsWaiting(true);

    // Send the message to the agent
    const conversationId = await sendMessage(message);

    // Start listening to the SSE stream for the conversation status if the streamConversationStatus function is provided
    if (streamConversationStatus) openSseStream(conversationId);

    setIsWaiting(false);
  }

  // Fade-in / fade-out logic for the agent bubble
  useEffect(() => {
    if (visibleMessage) {
      setDisplayedMessage(visibleMessage);
      setMessageVisible(true);
    } else {
      setMessageVisible(false);
      const t = setTimeout(() => setDisplayedMessage(undefined), 400);
      return () => clearTimeout(t);
    }
  }, [visibleMessage]);

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

  /**
   * The waiting indicator should be shown when: 
   * - the user has sent a message and the message is being sent to the server
   * - the SSE stream is active and there are no messages visible in the UI
   */
  const showWaitingIndicator = () => {
    
    if (isWaiting) return true;

    if (sseActive && !visibleMessage) return true;

    return false;
  }

  useEffect(() => {

    const last = sseMessages?.[sseMessages.length - 1]?.data?.message;

    if (!last) return;

    setVisibleMessage(last);

    const t = setTimeout(() => setVisibleMessage(undefined), 5000);

    return () => clearTimeout(t);

  }, [sseMessages]);

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
      {showWaitingIndicator() && <WaitingIndicator />}

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
