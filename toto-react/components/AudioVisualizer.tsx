"use client";

import { useEffect, useRef, useState } from "react";

/** Pixel width of each bar */
const BAR_WIDTH = 3;
/** Pixel gap between bars */
const BAR_GAP = 2;
/** Multiplier applied to the normalised amplitude (0–1) to amplify quiet
 *  microphone signals and make the bars visually prominent. The raw average
 *  frequency value from `getByteFrequencyData` is divided by 255 (max byte
 *  value) then multiplied by this factor so that typical speech (avg ~30–60
 *  out of 255) maps to a useful bar height percentage. */
const AMPLITUDE_MULTIPLIER = 400;

/** How often (ms) a new bar sample is captured */
const SAMPLE_INTERVAL_MS = 80;

interface Bar {
  id: number;
  height: number;
}

export type AudioVisualizerTheme = "default" | "dark" | "light" | "accent";

const THEME_CLASS: Record<AudioVisualizerTheme, string> = {
  default: "bg-cyan-600",
  dark: "bg-cyan-800",
  light: "bg-cyan-200",
  accent: "bg-lime-200",
};

export interface AudioVisualizerProps {
  /** The live microphone MediaStream; null when not recording. */
  stream: MediaStream | null;
  /** Whether recording is currently active. */
  isRecording: boolean;
  /** Height of the visualizer container in pixels. */
  height: number;
  /** Color theme for the bars. Defaults to "default" (cyan-600). */
  theme?: AudioVisualizerTheme;
}

/**
 * Renders an animated audio-level visualizer as a row of vertical bars
 * overlaid on the parent element (parent must be `position: relative`).
 *
 * Bars scroll from right to left: new bars are appended on the right and
 * the oldest bars are removed from the left once the container is full.
 */
export function AudioVisualizer({ stream, isRecording, height, theme = "default" }: AudioVisualizerProps) {
  const [bars, setBars] = useState<Bar[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const barCounterRef = useRef(0);
  const maxBarsRef = useRef(50);

  // Keep maxBars in sync with the container width so bars always fill it exactly.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const width = el.offsetWidth;
      maxBarsRef.current = Math.max(1, Math.floor(width / (BAR_WIDTH + BAR_GAP)));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Audio processing + animation loop.
  useEffect(() => {
    if (!isRecording || !stream) {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      setBars([]);
      return;
    }

    let audioContext: AudioContext;
    try {
      audioContext = new AudioContext();
    } catch (err) {
      console.error("AudioVisualizer: failed to create AudioContext", err);
      return;
    }

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let lastSampleTime = 0;

    const animate = (timestamp: number) => {
      if (timestamp - lastSampleTime >= SAMPLE_INTERVAL_MS) {
        lastSampleTime = timestamp;

        analyser.getByteFrequencyData(dataArray);

        const sum = dataArray.reduce((acc, v) => acc + v, 0);
        const avg = sum / dataArray.length;
        // Scale to a 4–100 % height range; AMPLITUDE_MULTIPLIER boosts quiet signals.
        const height = Math.max(4, Math.min(100, (avg / 255) * AMPLITUDE_MULTIPLIER));

        setBars((prev) => {
          const newBar: Bar = { id: ++barCounterRef.current, height };
          const next = [...prev, newBar];
          const max = maxBarsRef.current;
          return next.length > max ? next.slice(next.length - max) : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      audioContext.close();
    };
  }, [isRecording, stream]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center overflow-hidden pointer-events-none"
      style={{ paddingLeft: 2, paddingRight: BAR_GAP * 3, height: `${height}px`, maxHeight: `${height}px`, marginRight: BAR_GAP * 3 }}
      aria-hidden="true"
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={THEME_CLASS[theme]}
          style={{
            width: BAR_WIDTH,
            height: `${bar.height}%`,
            maxHeight: `${height}px`,
            borderRadius: 2,
            flexShrink: 0,
            marginRight: BAR_GAP,
          }}
        />
      ))}
    </div>
  );
}
