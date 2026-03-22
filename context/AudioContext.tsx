'use client'

import { createContext, useContext, useRef, useCallback, useState, useEffect } from 'react';

// A minimal silent WAV used to unlock the Audio element during a user gesture (needed for Safari).
const SILENT_AUDIO_SRC = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';

interface AudioContextType {
    play: (audioUrl: string, onEnded?: () => void) => Promise<void>;
    stop: () => void;
    pause: () => void;
    replay: () => Promise<void>;
    /** Call this inside a user-gesture handler (e.g. mic button press) to pre-unlock the audio
     *  element for Safari, which otherwise blocks programmatic playback in async callbacks. */
    unlock: () => void;
    isSpeaking: boolean;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
    // A single persistent Audio element reused for every play call.
    // Safari allows subsequent async .play() calls on an element that was already
    // activated by a user gesture, so we never create a new Audio() per call.
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const endedHandlerRef = useRef<(() => void) | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const lastAudioUrlRef = useRef<string | null>(null);

    useEffect(() => {
        audioRef.current = new Audio();

        return () => {
            audioRef.current?.pause();
            audioRef.current = null;
        };
    }, []);

    const stop = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, []);

    const pause = useCallback(() => {
        audioRef.current?.pause();
    }, []);

    const unlock = useCallback(() => {
        if (!audioRef.current) return;

        const audio = audioRef.current;

        audio.src = SILENT_AUDIO_SRC;
        audio.play().then(() => audio.pause()).catch(() => {});
    }, []);

    const play = useCallback(async (audioUrl: string, onEnded?: () => void) => {
        stop();

        if (!audioRef.current) return;

        const audio = audioRef.current;
        lastAudioUrlRef.current = audioUrl;

        if (endedHandlerRef.current) {
            audio.removeEventListener('ended', endedHandlerRef.current);
        }

        const handleEnded = () => {
            setIsSpeaking(false);
            if (onEnded) onEnded();
        };

        endedHandlerRef.current = handleEnded;
        audio.addEventListener('ended', handleEnded);

        audio.src = audioUrl;
        audio.load();

        setIsSpeaking(true);

        audio.play().catch((error) => {
            if (error.name !== 'AbortError') {
                console.error('Error playing audio:', error);
            }
            setIsSpeaking(false);
        });
    }, [stop]);

    const replay = useCallback(async () => {
        if (lastAudioUrlRef.current) {
            await play(lastAudioUrlRef.current);
        }
    }, [play]);

    return (
        <AudioContext.Provider value={{ play, stop, pause, replay, unlock, isSpeaking }}>
            {children}
        </AudioContext.Provider>
    );
}

export function useAudio() {
    const context = useContext(AudioContext);
    if (context === undefined) {
        throw new Error('useAudio must be used within an AudioProvider');
    }
    return context;
}
