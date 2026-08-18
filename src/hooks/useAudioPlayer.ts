import { useCallback, useRef, useState } from 'react';

/**
 * Plays a voice-pack MP3 (served from /audio/{sentenceId}.mp3 on Pages).
 * Falls back to browser TTS if the file is missing or unsupported.
 *
 * Flow: play(sentenceId, english) → plays MP3 once → onPlayEnd fires.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const onEndRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlaying(false);
    onEndRef.current = null;
  }, []);

  const play = useCallback(
    (sentenceId: string, english: string, onPlayEnd?: () => void) => {
      stop();
      onEndRef.current = onPlayEnd ?? null;
      setPlaying(true);

      const mp3Url = `/audio/${sentenceId}.mp3`;
      const audio = new Audio(mp3Url);
      audioRef.current = audio;

      audio.onended = () => {
        setPlaying(false);
        onEndRef.current?.();
        onEndRef.current = null;
      };

      audio.onerror = () => {
        // MP3 missing or unsupported — fall back to browser TTS
        audioRef.current = null;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utter = new SpeechSynthesisUtterance(english);
          utter.lang = 'en-IN';
          utter.rate = 0.92;
          utter.onend = () => {
            setPlaying(false);
            onEndRef.current?.();
            onEndRef.current = null;
          };
          utter.onerror = () => {
            setPlaying(false);
            onEndRef.current?.();
            onEndRef.current = null;
          };
          synth.speak(utter);
        } else {
          setPlaying(false);
          onEndRef.current?.();
          onEndRef.current = null;
        }
      };

      audio.play().catch(() => {
        // Auto-play blocked — retry without auto-play; user tapped so it should work
        audioRef.current = null;
        setPlaying(false);
        onEndRef.current?.();
        onEndRef.current = null;
      });
    },
    [stop],
  );

  return { playing, play, stop };
}
