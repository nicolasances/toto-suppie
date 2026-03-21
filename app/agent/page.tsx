"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import { useHeader } from "@/context/HeaderContext";
import { useAudio } from "@/context/AudioContext";
import { MediaRecorderEvent, useVoiceRecording } from "@/toto-react/hooks/useVoiceRecording";
import { WhisperAPI } from "@/toto-react/api/WhisperAPI";
import { AudioVisualizer } from "@/toto-react/components/AudioVisualizer";
import RoundButton from "@/toto-react/components/buttons/RoundButton";
import { MaskedSvgIcon } from "@/toto-react/components/MaskedSvgIcon";
import { SuppieAgent } from "@/api/SupermarketAgent";
import { SupermarketAPI } from "@/api/SupermarketAPI";
import { GoogleTTSAPI } from "@/toto-react/api/GoogleTTSAPI";

type PageState =
    | 'idle'
    | 'recordingRequested'
    | 'recordingStarted'
    | 'stoppingRecording'
    | 'transcribing'
    | 'agentProcessing';

export default function AgentScreen() {

    const { setConfig } = useHeader();
    const { play, stop } = useAudio();
    const [pageState, setPageState] = useState<PageState>('idle');
    const [agentMessages, setAgentMessages] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const speakMessage = useCallback(async (text: string) => {
        try {
            const url = await new GoogleTTSAPI().synthesizeSpeech(text);
            await play(url);
        } catch (err) {
            console.error('TTS error:', err);
        }
    }, [play]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [agentMessages, pageState]);

    useEffect(() => {
        setConfig({
            title: "Agent",
            backButton: { enabled: true },
        });
    }, [setConfig]);

    const onRecordingComplete = useCallback(async (audioBlob: Blob) => {
        setPageState('transcribing');
        try {
            const result = await new WhisperAPI().transcribeAudio(audioBlob, 'toto');
            if (!result.text) {
                setPageState('idle');
                return;
            }

            setPageState('agentProcessing');

            const { conversationId } = await new SuppieAgent().postMessage(result.text);
            const response = await new SupermarketAPI().streamConversationStatus(conversationId);
            const reader = response.body?.getReader();

            if (!reader) {
                setPageState('idle');
                return;
            }

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
                    else if (line.startsWith('data:') && currentEvent === 'message') {
                        try {
                            const data = JSON.parse(line.slice(5).trim());
                            if (data.message) {
                                setAgentMessages(prev => [...prev, data.message as string]);
                                speakMessage(data.message as string);
                            }
                        } catch (e) { console.error('Failed to parse SSE data:', e); }
                        currentEvent = 'message';
                    }
                }
            }

            setPageState('idle');
        } catch (err) {
            console.error('Agent interaction error:', err);
            setPageState('idle');
        }
    }, [speakMessage]);

    const onRecordingEvent = useCallback((event: MediaRecorderEvent) => {
        if (event === 'recordingStarted') setPageState('recordingStarted');
    }, []);

    const { startRecording, stopRecording, stream } = useVoiceRecording({
        onRecordingComplete,
        onEvent: onRecordingEvent,
    });

    const toggleRecording = async () => {
        if (pageState === 'idle') {
            stop();
            setPageState('recordingRequested');
            await startRecording();
        } else if (pageState === 'recordingStarted') {
            setPageState('stoppingRecording');
            await stopRecording();
        }
    };

    const isRecordingActive = pageState === 'recordingStarted';
    const isRecordingLayout = pageState === 'recordingStarted' || pageState === 'stoppingRecording';

    return (
        <GenericHomeScreen>
            <div className="flex flex-col flex-1 overflow-hidden pb-28">

                {/* Top: Agent icon */}
                <div className="flex justify-center pt-8 mb-4 shrink-0">
                    <MaskedSvgIcon src="/images/agent.svg" alt="Agent" size="w-16 h-16" color="bg-cyan-800" />
                </div>

                {/* Center: Conversation */}
                <div className="flex flex-col flex-1 overflow-y-auto items-center px-4 pt-4">
                    <div className="flex flex-col gap-3 w-full max-w-lg pt-3">

                        {/* Agent messages accumulated from the SSE stream */}
                        {agentMessages.map((msg, i) => (
                            <div key={i} className={`text-lg px-4 py-2 rounded-3xl opacity-90 ${i == agentMessages.length - 1 ? 'text-cyan-900' : 'text-cyan-700'}`}>
                                {msg}
                            </div>
                        ))}

                        {/* Bouncing dots while agent is processing */}
                        {pageState === 'agentProcessing' && (
                            <div className="flex justify-center pt-4">
                                <WaitingIndicator />
                            </div>
                        )}

                        <div ref={messagesEndRef} />

                    </div>
                </div>

            </div>

            {/* Fixed bottom: mic/stop button + audio visualizer */}
            {(pageState === 'idle' || pageState === 'recordingRequested' || pageState === 'recordingStarted' || pageState === 'stoppingRecording') && (
                <div className="fixed bottom-4 left-0 right-0 h-20">
                    {/* AudioVisualizer: slides in from the left when recording starts */}
                    <div
                        className="absolute inset-y-0 left-0 transition-all duration-500 ease-in-out"
                        style={{
                            right: isRecordingLayout ? '68px' : '100%',
                            opacity: isRecordingLayout ? 1 : 0,
                        }}
                    >
                        <AudioVisualizer stream={stream} isRecording={isRecordingActive} height={80} theme="dark" />
                    </div>

                    {/* Button: slides from center to bottom-right when recording starts */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
                        style={{ right: isRecordingLayout ? '12px' : 'calc(50% - 22px)' }}
                    >
                        {!isRecordingActive ? (
                            <RoundButton
                                svgIconPath={{ src: "/images/microphone.svg", alt: "Talk" }}
                                onClick={() => void toggleRecording()}
                                size="m"
                                type="filledSecondary"
                                disabled={pageState === 'recordingRequested' || pageState === 'stoppingRecording'}
                            />
                        ) : (
                            <RoundButton
                                svgIconPath={{ src: "/images/stop-recording.svg", alt: "Stop Recording" }}
                                onClick={() => void toggleRecording()}
                                size="m"
                                type="filledSecondary"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Fixed bottom: Transcribing indicator */}
            {pageState === 'transcribing' && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center pb-8">
                    <TranscribingIndicator />
                </div>
            )}
        </GenericHomeScreen>
    );
}

function WaitingIndicator() {
    return (
        <div className="flex items-center gap-1">
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

function TranscribingIndicator() {
    const [dotCount, setDotCount] = useState(1);

    useEffect(() => {
        const interval = setInterval(() => {
            setDotCount(prev => (prev === 3 ? 1 : prev + 1));
        }, 500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="text-cyan-700 italic text-lg">
            Transcribing{'.'.repeat(dotCount)}
        </div>
    );
}
