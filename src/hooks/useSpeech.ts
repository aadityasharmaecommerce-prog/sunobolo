import { useCallback, useEffect, useRef, useState } from 'react';
import { METHOD } from '@/constants';

export interface SpeakOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export interface RepeatOptions extends SpeakOptions {
  /** Delay between repetitions (ms). */
  gapMs?: number;
  onProgress?: (completedCount: number) => void;
  onComplete?: () => void;
}

const GAP_MS = METHOD.listenGapMs;
const DEFAULT_RATE = METHOD.ttsRate;

function pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  // Preference order: en-IN > en-GB > en-US > any 'en'.
  const langs = ['en-IN', 'en-GB', 'en-US'];
  for (const lang of langs) {
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(lang));
    if (match) return match;
  }
  return voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ?? voices[0] ?? null;
}

/**
 * Reusable browser TTS hook (Web Speech API).
 * - `speak` one sentence
 * - `speakRepeated` speaks the text N times with a pause in between
 * - gracefully falls back to the browser's default voice
 * - returns `supported` so the UI can show a fallback message
 */
export function useSpeech() {
  const [supported] = useState<boolean>(
    typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const [speaking, setSpeaking] = useState(false);
  const [repProgress, setRepProgress] = useState(0);
  const [repTotal, setRepTotal] = useState(0);
  const [voiceName, setVoiceName] = useState<string | null>(null);

  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const timersRef = useRef<number[]>([]);
  const onCompleteRef = useRef<(() => void) | null>(null);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }, []);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const v = pickEnglishVoice(synth.getVoices());
      voiceRef.current = v;
      setVoiceName(v?.name ?? null);
    };
    loadVoices();
    synth.addEventListener('voiceschanged', loadVoices);
    return () => {
      synth.removeEventListener('voiceschanged', loadVoices);
      synth.cancel();
      clearTimers();
    };
  }, [supported, clearTimers]);

  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    clearTimers();
    setSpeaking(false);
    setRepProgress(0);
    setRepTotal(0);
    onCompleteRef.current = null;
  }, [supported, clearTimers]);

  /** Speaks `text` `count` times sequentially with a gap between repetitions. */
  const speakRepeated = useCallback(
    (text: string, count: number, opts: RepeatOptions = {}) => {
      if (!supported) return;
      const { gapMs = GAP_MS, onProgress, onComplete } = opts;
      stop();
      setSpeaking(true);
      setRepTotal(count);
      setRepProgress(0);
      onCompleteRef.current = onComplete ?? null;

      const synth = window.speechSynthesis;
      let completed = 0;

      const playNext = () => {
        if (completed >= count) {
          setSpeaking(false);
          const cb = onCompleteRef.current;
          onCompleteRef.current = null;
          cb?.();
          return;
        }
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = 'en-IN';
        if (voiceRef.current) utter.voice = voiceRef.current;
        utter.rate = opts.rate ?? DEFAULT_RATE;
        utter.pitch = opts.pitch ?? 1;
        utter.volume = opts.volume ?? 1;
        const finishOne = () => {
          completed++;
          setRepProgress(completed);
          onProgress?.(completed);
          if (completed < count) {
            const t = window.setTimeout(playNext, gapMs);
            timersRef.current.push(t);
          } else {
            setSpeaking(false);
            const cb = onCompleteRef.current;
            onCompleteRef.current = null;
            cb?.();
          }
        };
        utter.onend = finishOne;
        utter.onerror = finishOne;
        synth.speak(utter);
      };

      playNext();
    },
    [supported, stop],
  );

  /** Speaks once; `onEnd` fires when finished. */
  const speak = useCallback(
    (text: string, opts: SpeakOptions = {}, onEnd?: () => void) => {
      if (!supported) return;
      setSpeaking(true);
      setRepProgress(0);
      setRepTotal(1);
      const synth = window.speechSynthesis;
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'en-IN';
      if (voiceRef.current) utter.voice = voiceRef.current;
      utter.rate = opts.rate ?? DEFAULT_RATE;
      utter.pitch = opts.pitch ?? 1;
      utter.volume = opts.volume ?? 1;
      utter.onend = () => {
        setSpeaking(false);
        setRepProgress(1);
        onEnd?.();
      };
      utter.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      synth.speak(utter);
    },
    [supported],
  );

  return { supported, speaking, repProgress, repTotal, voiceName, speak, speakRepeated, stop };
}
