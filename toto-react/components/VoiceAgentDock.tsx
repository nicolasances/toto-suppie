"use client";

import { useEffect, useState } from "react";
import type { AgentVoiceState } from "@/toto-react/hooks/useAgentVoiceInteraction";
import { AudioVisualizer } from "@/toto-react/components/AudioVisualizer";
import RoundButton from "@/toto-react/components/buttons/RoundButton";

export interface VoiceAgentDockProps {
    state: AgentVoiceState;
    stream: MediaStream | null;
    onToggleRecording: () => Promise<void>;
}

export function VoiceAgentDock({ state, stream, onToggleRecording }: VoiceAgentDockProps) {
    const isRecordingActive = state === 'recordingStarted';
    const isRecordingLayout = state === 'recordingStarted' || state === 'stoppingRecording';

    if (state === 'agentProcessing') return null;

    return (
        <>
            {/* Fixed bottom: mic/stop button + audio visualizer */}
            {(state === 'idle' || state === 'recordingRequested' || state === 'recordingStarted' || state === 'stoppingRecording') && (
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
                                onClick={() => void onToggleRecording()}
                                size="m"
                                type="filledSecondary"
                                disabled={state === 'recordingRequested' || state === 'stoppingRecording'}
                            />
                        ) : (
                            <RoundButton
                                svgIconPath={{ src: "/images/stop-recording.svg", alt: "Stop Recording" }}
                                onClick={() => void onToggleRecording()}
                                size="m"
                                type="filledSecondary"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Fixed bottom: Transcribing indicator */}
            {state === 'transcribing' && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-start pb-8">
                    <TranscribingIndicator />
                </div>
            )}
        </>
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
        <div className="text-cyan-700 text-lg px-4">
            Transcribing{'.'.repeat(dotCount)}
        </div>
    );
}
