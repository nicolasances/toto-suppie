import { useCallback, useState } from 'react';
import { MediaRecorderEvent, useVoiceRecording } from '@/toto-react/hooks/useVoiceRecording';
import { useAudio } from '@/toto-react/context/AudioContext';
import { GoogleSTTAPI } from '@/toto-react/api/GoogleSTTAPI';
import { GoogleTTSAPI } from '@/toto-react/api/GoogleTTSAPI';
import { GaleBrokerAPI } from '@/toto-react/api/GaleBrokerAPI';

export type AgentVoiceState =
    | 'idle'
    | 'recordingRequested'
    | 'recordingStarted'
    | 'stoppingRecording'
    | 'transcribing'
    | 'agentProcessing';

export interface UseAgentVoiceInteractionOptions {
    sendMessage: (text: string) => Promise<string>;
}

export interface UseAgentVoiceInteractionResult {
    state: AgentVoiceState;
    messages: string[];
    toggleRecording: () => Promise<void>;
    stream: MediaStream | null;
}

export function useAgentVoiceInteraction({
    sendMessage,
}: UseAgentVoiceInteractionOptions): UseAgentVoiceInteractionResult {

    const { play, stop, unlock } = useAudio();
    const [state, setState] = useState<AgentVoiceState>('idle');
    const [messages, setMessages] = useState<string[]>([]);

    const speakMessage = useCallback(async (text: string) => {
        try {
            const url = await new GoogleTTSAPI().synthesizeSpeech(text);
            await play(url);
        } catch (err) {
            console.error('TTS error:', err);
        }
    }, [play]);

    const onRecordingComplete = useCallback(async (audioBlob: Blob) => {
        setState('transcribing');
        try {
            const result = await new GoogleSTTAPI().transcribeAudio(audioBlob);

            if (!result.text) {
                setState('idle');
                return;
            }

            setState('agentProcessing');

            const conversationId = await sendMessage(result.text);
            const response = await new GaleBrokerAPI().streamConversationStatus(conversationId);
            const reader = response.body?.getReader();

            if (!reader) {
                setState('idle');
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
                                setMessages(prev => [...prev, data.message as string]);
                                speakMessage(data.message as string);
                            }
                        } catch (e) { console.error('Failed to parse SSE data line:', line, e); }
                        currentEvent = 'message';
                    }
                }
            }

            setState('idle');
        } catch (err) {
            console.error('Agent interaction error:', err);
            setState('idle');
        }
    }, [sendMessage, speakMessage]);

    const onRecordingEvent = useCallback((event: MediaRecorderEvent) => {
        if (event === 'recordingStarted') setState('recordingStarted');
    }, []);

    const { startRecording, stopRecording, stream } = useVoiceRecording({
        onRecordingComplete,
        onEvent: onRecordingEvent,
    });

    const toggleRecording = useCallback(async () => {
        if (state === 'idle') {
            // Unlock the Audio element inside the user gesture so Safari allows
            // async playback later when the agent response arrives.
            unlock();
            stop();
            setState('recordingRequested');
            await startRecording();
        } else if (state === 'recordingStarted') {
            setState('stoppingRecording');
            await stopRecording();
        }
    }, [state, unlock, stop, startRecording, stopRecording]);

    return { state, messages, toggleRecording, stream };
}

