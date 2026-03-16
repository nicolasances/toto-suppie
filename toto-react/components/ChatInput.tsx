"use client";

import { useLayoutEffect, useRef, useState, useCallback } from "react";
import RoundButton from "@/toto-react/components/buttons/RoundButton";
import { MediaRecorderEvent, useVoiceRecording } from "@/toto-react/hooks/useVoiceRecording";
import { WhisperAPI } from "@/toto-react/api/WhisperAPI";
import { AudioVisualizer } from "@/toto-react/components/AudioVisualizer";

type VoiceRecordingState = 'idle' | 'recordingRequested' | 'recordingStarted' | 'stoppingRecording' | 'transcribing';

export interface ChatInputHandlers {
  onSendMessage: (message: string) => void | Promise<void>;
}

interface ChatInputProps {
  handlers: ChatInputHandlers;
  disabled?: boolean;
}

export default function ChatInput({ handlers, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceRecordingState>('idle');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const maxTextAreaHeight = 240;
  const minTextAreaHeight = 32;

  const onRecordingComplete = useCallback(async (audioBlob: Blob) => {
    setVoiceState('transcribing');
    try {
      const result = await new WhisperAPI().transcribeAudio(audioBlob, 'toto');
      if (result.text) {
        setMessage(result.text);
      }
    } catch (error) {
      console.error('Transcription error:', error);
    } finally {
      setVoiceState('idle');
    }
  }, []);

  const onRecordingEvent = useCallback((event: MediaRecorderEvent) => {
    if (event === 'recordingStarted') setVoiceState('recordingStarted');
  }, []);

  const { startRecording, stopRecording, stream } = useVoiceRecording({
    onRecordingComplete,
    onEvent: onRecordingEvent,
  });

  useLayoutEffect(() => {
    if (!textareaRef.current) {
      return;
    }

    textareaRef.current.style.height = "auto";
    const newHeight = Math.min(textareaRef.current.scrollHeight, maxTextAreaHeight);
    textareaRef.current.style.height = `${newHeight}px`;
    setIsExpanded(newHeight > minTextAreaHeight);
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

    if (!trimmedMessage || isSending || disabled) {
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      await handlers.onSendMessage(trimmedMessage);
    } finally {
      setIsSending(false);
    }
  };

  const toggleRecording = async () => {
    if (voiceState === 'idle') {
      setVoiceState('recordingRequested');
      await startRecording();
    } else if (voiceState === 'recordingStarted') {
      setVoiceState('stoppingRecording');
      await stopRecording();
    }
  };

  const isVoiceBusy = voiceState !== 'idle';
  const isRecordingActive = voiceState === 'recordingStarted';

  return (
    <div className="max-w-4xl mx-auto">
      <div className={`flex items-end border border-cyan-700 pl-6 pr-4 py-3 mb-2 shadow ${isExpanded ? "rounded-3xl" : "rounded-full"}`}>
        <div className="relative flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            onChange={onChangeHandler}
            onKeyDown={onKeyDownHandler}
            value={message}
            disabled={disabled || isVoiceBusy}
            className="bg-transparent border-0 focus:outline-none w-full text-xl no-scrollbar pr-2 disabled:opacity-40 disabled:cursor-not-allowed"
            rows={1}
            style={{
              resize: "none",
              overflowY: message.length > 0 && (textareaRef.current?.scrollHeight ?? 0) > maxTextAreaHeight ? "auto" : "hidden",
              minHeight: `${minTextAreaHeight}px`,
              maxHeight: `${maxTextAreaHeight}px`,
              paddingTop: "4px",
            }}
          ></textarea>
          {voiceState === 'transcribing' && <div className="absolute inset-0 mt-[4px] italic text-cyan-700">Transcribing...</div>}
          <AudioVisualizer stream={stream} isRecording={isRecordingActive} height={32} />
        </div>
        <div className="flex justify-end fill-cyan-800 gap-2">
          {!message && !isSending && !disabled && !isRecordingActive && (
            <RoundButton
              svgIconPath={{ src: "/images/microphone.svg", alt: "Talk" }}
              onClick={() => void toggleRecording()}
              size="s"
              type="filledSecondary"
              disabled={voiceState === 'recordingRequested' || voiceState === 'stoppingRecording' || voiceState === 'transcribing'}
              loading={voiceState === 'transcribing'}
            />
          )}
          {isRecordingActive && (
            <RoundButton
              svgIconPath={{ src: "/images/stop-recording.svg", alt: "Stop Recording" }}
              onClick={() => void toggleRecording()}
              size="s"
              type="filledSecondary"
            />
          )}
          {!isSending && (
            <RoundButton
              svgIconPath={{ src: "/images/send.svg", alt: "Send" }}
              onClick={() => void sendMessage()}
              size="s"
              disabled={disabled || message.trim().length === 0 || isVoiceBusy}
              type="filled"
            />
          )}
        </div>
      </div>
    </div>
  );
}
