"use client";

import { useRef, useState } from "react";
import RoundButton from "@/toto-react/components/buttons/RoundButton";

export interface ChatInputHandlers {
  onSendMessage: (message: string) => void | Promise<void>;
}

interface ChatInputProps {
  handlers: ChatInputHandlers;
}

export default function ChatInput({
  handlers,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxTextAreaHeight = 240;
  const minTextAreaHeight = 64;

  const adjustTextAreaHeight = () => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    const newHeight = Math.min(textareaRef.current.scrollHeight, maxTextAreaHeight);
    textareaRef.current.style.height = `${newHeight}px`;
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
    adjustTextAreaHeight();
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isSending) {
      return;
    }

    setIsSending(true);

    try {
      await handlers.onSendMessage(trimmedMessage);
      setMessage("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-20 p-3 border-t" style={{ backgroundColor: "var(--background)", borderColor: "var(--foreground-ghost)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col border border-cyan-800 rounded-xl px-4 py-3 mb-2">
          <textarea
            ref={textareaRef}
            onChange={onChangeHandler}
            value={message}
            className="bg-transparent border-0 focus:outline-none w-full text-xl no-scrollbar"
            rows={1}
            style={{
              resize: "none",
              overflowY: message.length > 0 && (textareaRef.current?.scrollHeight ?? 0) > maxTextAreaHeight ? "auto" : "hidden",
              minHeight: `${minTextAreaHeight}px`,
              maxHeight: `${maxTextAreaHeight}px`,
            }}
          ></textarea>
          <div className="flex justify-end fill-cyan-800">
            {!isSending && (
              <RoundButton
                svgIconPath={{ src: "/images/send.svg", alt: "Send", color: "bg-cyan-600" }}
                onClick={() => void sendMessage()}
                size="s"
                disabled={message.trim().length === 0}
                dark
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
