import { useEffect, useRef } from "react";
import ChatInput, { ChatInputHandlers } from "@/toto-react/components/ChatInput";

export function ChatDock({
  chatInputHandlers,
  onHeightChange,
}: {
  chatInputHandlers: ChatInputHandlers;
  onHeightChange: (height: number) => void;
}) {
  const dockRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dockRef.current) return;

    const element = dockRef.current;
    const updateHeight = () => onHeightChange(Math.ceil(element.getBoundingClientRect().height));

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => observer.disconnect();
  }, [onHeightChange]);

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
      <ChatInput handlers={chatInputHandlers} />
    </div>
  );
}
