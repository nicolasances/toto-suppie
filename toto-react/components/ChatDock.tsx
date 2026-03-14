"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ChatInput from "@/toto-react/components/ChatInput";

/**
 * Props for the {@link ChatDock} component.
 */
export interface ChatDockProps {
  /**
   * Async function called when the user submits a message.
   *
   * The function receives the raw text typed by the user and must return a
   * **conversation ID** string. If {@link streamConversationStatus} is also
   * provided, the returned conversation ID is passed straight into that
   * function to open the SSE stream for that conversation.
   *
   * @param message - The message text entered by the user.
   * @returns A promise that resolves to the conversation ID produced by the backend.
   *
   * @example
   * ```tsx
   * const sendMessage = async (message: string) => {
   *   const res = await fetch("/api/chat", {
   *     method: "POST",
   *     body: JSON.stringify({ message }),
   *   });
   *   const { conversationId } = await res.json();
   *   return conversationId;
   * };
   * ```
   */
  sendMessage: (message: string) => Promise<string>;

  /**
   * Optional async function that opens a **Server-Sent Events (SSE)** stream
   * for a given conversation.
   *
   * When provided, `ChatDock` calls this function with the conversation ID
   * returned by {@link sendMessage} and starts consuming the stream. Each
   * `message` event is expected to carry a JSON payload with a `message`
   * property (`{ message: string }`). Received messages are displayed in a
   * floating agent-bubble above the input bar and auto-dismiss after 5 seconds.
   *
   * `done` / non-`message` events are silently ignored by the component.
   *
   * @param chatConversationId - The conversation ID to stream status for.
   * @returns A promise that resolves to the raw `Response` object whose body
   *   is the SSE stream.
   *
   * @example
   * ```tsx
   * const streamConversationStatus = async (chatConversationId: string) => {
   *   return fetch(`/api/chat/${chatConversationId}/stream`);
   * };
   * ```
   */
  streamConversationStatus?: (chatConversationId: string) => Promise<Response>;

  /**
   * Callback invoked whenever the height of the chat input section changes.
   *
   * `ChatDock` is rendered with `position: fixed` at the bottom of the
   * viewport. Use this callback to add equivalent bottom padding to your
   * scrollable content area so nothing is obscured by the dock.
   *
   * The value is measured via `ResizeObserver` and is already rounded up with
   * `Math.ceil`, so it is safe to use directly as a CSS pixel value.
   *
   * @param height - The current height of the input section in pixels.
   *
   * @example
   * ```tsx
   * const [dockHeight, setDockHeight] = useState(0);
   *
   * return (
   *   <>
   *     <div style={{ paddingBottom: dockHeight }}>
   *       {/* scrollable content *\/}
   *     </div>
   *     <ChatDock onHeightChange={setDockHeight} ... />
   *   </>
   * );
   * ```
   */
  onHeightChange: (height: number) => void;
}

interface SSEMessage {
  event: string;
  data: any;
  receivedAt: string;
}

/**
 * `ChatDock` is a fixed-position chat input bar that sticks to the bottom of
 * the viewport. It handles the full lifecycle of a user message exchange:
 *
 * 1. **Input** – renders a {@link ChatInput} text field.
 * 2. **Submission** – calls `sendMessage` with the user's text and awaits a
 *    conversation ID.
 * 3. **Streaming** – if `streamConversationStatus` is supplied, opens an SSE
 *    stream for the returned conversation ID and displays each incoming
 *    message in a floating "agent bubble" above the bar. Bubbles auto-dismiss
 *    after 5 seconds with a fade-out transition.
 * 4. **Waiting indicator** – shows an animated three-dot bouncing indicator
 *    while the message is in-flight or while the SSE stream is active but no
 *    message has been shown yet.
 * 5. **Height reporting** – measures its own input-section height via
 *    `ResizeObserver` and forwards it through `onHeightChange` so the parent
 *    can apply matching bottom padding to any scrollable content.
 *
 * @example
 * ```tsx
 * import { ChatDock } from "@/toto-react/components/ChatDock";
 *
 * export default function Page() {
 *   const [dockHeight, setDockHeight] = useState(0);
 *
 *   const sendMessage = async (message: string) => {
 *     const res = await fetch("/api/chat", {
 *       method: "POST",
 *       body: JSON.stringify({ message }),
 *     });
 *     const { conversationId } = await res.json();
 *     return conversationId;
 *   };
 *
 *   const streamConversationStatus = async (id: string) =>
 *     fetch(`/api/chat/${id}/stream`);
 *
 *   return (
 *     <div style={{ paddingBottom: dockHeight }}>
 *       {/* page content *\/}
 *       <ChatDock
 *         sendMessage={sendMessage}
 *         streamConversationStatus={streamConversationStatus}
 *         onHeightChange={setDockHeight}
 *       />
 *     </div>
 *   );
 * }
 * ```
 */
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

    try {
      // Send the message to the agent
      const conversationId = await sendMessage(message);

      // Start listening to the SSE stream for the conversation status if the streamConversationStatus function is provided
      if (streamConversationStatus) openSseStream(conversationId);
    } finally {
      setIsWaiting(false);
    }
  }

  // Fade-in / fade-out logic for the agent bubble
  useEffect(() => {

    if (visibleMessage) {
      setDisplayedMessage(visibleMessage);
      setMessageVisible(true);
    }
    else {
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
  const showWaitingIndicator = useMemo(
    () => isWaiting || (sseActive && !visibleMessage),
    [isWaiting, sseActive, visibleMessage]
  );

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
      {showWaitingIndicator && (
          <WaitingIndicator />
      )}

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
        <ChatInput handlers={{ onSendMessage }} disabled={isWaiting || sseActive} />
      </div>
    </div>
  );
}


function WaitingIndicator() {
  return (
    <div className="flex items-center gap-1 px-8 pb-1">
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
