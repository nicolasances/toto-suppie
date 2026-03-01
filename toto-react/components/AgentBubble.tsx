"use client";

import { useEffect, useState } from "react";

export function AgentBubble({ message, bottomOffset }: { message: string | undefined; bottomOffset: number }) {
  const [displayedMessage, setDisplayedMessage] = useState<string | undefined>();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setDisplayedMessage(message);
      setVisible(true);
    } else {
      setVisible(false);
      const t = setTimeout(() => setDisplayedMessage(undefined), 400);
      return () => clearTimeout(t);
    }
  }, [message]);

  if (!displayedMessage) return null;

  return (
    <div
      className="fixed left-0 right-0 z-20 px-3"
      style={{
        bottom: `${bottomOffset}px`,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.9s ease",
        pointerEvents: "none",
      }}
    >
      <div className="relative pl-3 pr-10 opacity-90 w-fit">
        <div className="absolute w-2 h-2 top left-1 bg-cyan-400 rounded-full"></div>
        <div className="text-lg bg-cyan-400 px-4 py-2 rounded-3xl flex">
          {displayedMessage}
        </div>
      </div>
    </div>
  );
}
