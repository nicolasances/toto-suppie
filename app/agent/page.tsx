"use client";

import { useCallback, useEffect, useState } from "react";
import { GenericHomeScreen } from "@/app/components/GenericScreen";
import { useHeader } from "@/context/HeaderContext";
import { MediaRecorderEvent, useVoiceRecording } from "@/toto-react/hooks/useVoiceRecording";
import { WhisperAPI } from "@/toto-react/api/WhisperAPI";
import { AudioVisualizer } from "@/toto-react/components/AudioVisualizer";
import RoundButton from "@/toto-react/components/buttons/RoundButton";
import { MaskedSvgIcon } from "@/toto-react/components/MaskedSvgIcon";
import { SuppieAgent } from "@/api/SupermarketAgent";
import { SupermarketAPI } from "@/api/SupermarketAPI";

type PageState =
    | 'idle'
    | 'recordingRequested'
    | 'recordingStarted'
    | 'stoppingRecording'
    | 'transcribing'
    | 'agentProcessing'
    | 'done';

export default function AgentScreen() {

    const { setConfig } = useHeader();
    const [pageState, setPageState] = useState<PageState>('idle');
    const [agentMessages, setAgentMessages] = useState<string[]>([]);

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
            setAgentMessages([]);

            const { conversationId } = await new SuppieAgent().postMessage(result.text);
            const response = await new SupermarketAPI().streamConversationStatus(conversationId);
            const reader = response.body?.getReader();

            if (!reader) {
                setPageState('done');
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
                    } else if (line.startsWith('data:') && currentEvent === 'message') {
                        try {
                            const data = JSON.parse(line.slice(5).trim());
                            if (data.message) {
                                setAgentMessages(prev => [...prev, data.message as string]);
                            }
                        } catch (e) { console.error('Failed to parse SSE data:', e); }
                        currentEvent = 'message';
                    }
                }
            }

            setPageState('done');
        } catch (err) {
            console.error('Agent interaction error:', err);
            setPageState('idle');
        }
    }, []);

    const onRecordingEvent = useCallback((event: MediaRecorderEvent) => {
        if (event === 'recordingStarted') setPageState('recordingStarted');
    }, []);

    const { startRecording, stopRecording, stream } = useVoiceRecording({
        onRecordingComplete,
        onEvent: onRecordingEvent,
    });

    const toggleRecording = async () => {
        if (pageState === 'idle') {
            setPageState('recordingRequested');
            await startRecording();
        } else if (pageState === 'recordingStarted') {
            setPageState('stoppingRecording');
            await stopRecording();
        }
    };

    const reset = () => {
        setAgentMessages([]);
        setPageState('idle');
    };

    const isRecordingActive = pageState === 'recordingStarted';

    return (
        <GenericHomeScreen>
            <div className={`flex flex-col items-center flex-1 ${(pageState === 'agentProcessing' || pageState === 'done') ? 'justify-start pt-8' : 'justify-center'}`}>

                {/* Idle / Recording states – show mic or stop button in the center */}
                {(pageState === 'idle' || pageState === 'recordingRequested' || pageState === 'recordingStarted' || pageState === 'stoppingRecording') && (
                    <div className="flex flex-col items-center gap-4">
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
                )}

                {/* Agent processing / done states */}
                {(pageState === 'agentProcessing' || pageState === 'done') && (
                    <div className="flex flex-col items-center gap-4 w-full max-w-lg px-4">
                        <MaskedSvgIcon src="/images/agent.svg" alt="Agent" size="w-16 h-16" color="bg-cyan-800" />

                        {/* Bouncing dots while agent is processing */}
                        {pageState === 'agentProcessing' && <WaitingIndicator />}

                        {/* Agent messages accumulated from the SSE stream */}
                        {agentMessages.length > 0 && (
                            <div className="flex flex-col gap-3 w-full">
                                {agentMessages.map((msg, i) => (
                                    <div key={i} className="text-lg bg-cyan-400 px-4 py-2 rounded-3xl opacity-90">
                                        {msg}
                                    </div>
                                ))}
                            </div>
                        )}

                    </div>
                )}
            </div>

            {/* Fixed bottom: Clear button once the stream is complete */}
            {pageState === 'done' && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
                    <RoundButton
                        svgIconPath={{ src: "/images/close.svg", alt: "Clear" }}
                        onClick={reset}
                        size="m"
                        type="primary"
                    />
                </div>
            )}

            {/* Fixed bottom: AudioVisualizer while recording */}
            {isRecordingActive && (
                <div className="fixed bottom-0 left-0 right-0 h-16">
                    <AudioVisualizer stream={stream} isRecording={isRecordingActive} height={64} />
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
