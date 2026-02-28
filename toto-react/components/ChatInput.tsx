"use client";

import { useLayoutEffect, useRef, useState } from "react";
import RoundButton from "@/toto-react/components/buttons/RoundButton";

export interface ChatInputHandlers {
  onSendMessage: (message: string) => void | Promise<void>;
}

interface ChatInputProps {
  handlers: ChatInputHandlers;
}

export default function ChatInput({ handlers, }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxTextAreaHeight = 240;
  const minTextAreaHeight = 32;

  useLayoutEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    const newHeight = Math.min(textareaRef.current.scrollHeight, maxTextAreaHeight);
    textareaRef.current.style.height = `${newHeight}px`;
  }, [message]);

  const onChangeHandler = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  };

  const onKeyDownHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      sendMessage();
    }
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-end border border-cyan-700 rounded-3xl px-4 py-3 mb-2">
        <textarea
          ref={textareaRef}
          onChange={onChangeHandler}
          onKeyDown={onKeyDownHandler}
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
        <div className="flex justify-end fill-cyan-800 gap-2">
          {!message &&
            <RoundButton
              svgIconPath={{ src: "/images/microphone.svg", alt: "Talk" }}
              onClick={() => { }}
              size="s"
              type="filledSecondary"
            />
          }
          {!isSending && (
            <RoundButton
              svgIconPath={{ src: "/images/send.svg", alt: "Send" }}
              onClick={() => void sendMessage()}
              size="s"
              disabled={message.trim().length === 0}
              type="filled"
            />
          )}
        </div>
      </div>
    </div>
  );
}
