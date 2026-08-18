import { useCallback, useRef, useState } from 'react';

/**
 * Plays a voice-pack MP3 (served from /audio/{sentenceId}.mp3 on Pages).
 * Falls back to browser TTS if the file is missing or unsupported.
 *
 * Flow: play(sentenceId, english) → plays MP3 once → onPlayEnd fires.
 *
 * Key guarantees:
 *   - `play()` always uses the english text passed at call time (no stale closure).
 *   - Calling `play()` immediately cancels any in-flight audio.
 *   - The onPlayEnd callback is per-invocation, never shared across calls.
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  // Per-call callback storage — each play() call creates its own slot.
  const callbackRef = useRef<(() => void) | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load(); // release the media resource
      audioRef.current = null;
    }
    // Also cancel any browser TTS that might still be speaking
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setPlaying(false);
    callbackRef.current = null;
  }, []);

  /**
   * Play audio for a sentence.
   *
   * @param sentenceId  Unique ID used for the MP3 filename (e.g. "beginner-l1-s1")
   * @param english     The EXACT English text to speak (via MP3 or TTS fallback)
   * @param onPlayEnd   Callback when audio finishes (play count increments)
   */
  const play = useCallback(
    (sentenceId: string, english: string, onPlayEnd?: () => void) => {
      stop();
      setPlaying(true);
      callbackRef.current = onPlayEnd ?? null;

      const mp3Url = `/audio/${sentenceId}.mp3`;
      const audio = new Audio(mp3Url);
      audioRef.current = audio;

      const finishPlay = () => {
        // Only fire the callback if this audio is still the current one
        // (i.e. it wasn't stopped by a newer play() call).
        if (audioRef.current === audio) {
          audioRef.current = null;
          setPlaying(false);
          const cb = callbackRef.current;
          callbackRef.current = null;
          cb?.();
        }
      };

      audio.onended = finishPlay;

      audio.onerror = () => {
        // MP3 missing or unsupported — fall back to browser TTS
        audioRef.current = null;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          synth.cancel(); // stop any previous TTS
          const utter = new SpeechSynthesisUtterance(english);
          utter.lang = 'en-IN';
          utter.rate = 0.92;
          utter.onend = finishPlay;
          utter.onerror = finishPlay;
          synth.speak(utter);
        } else {
          finishPlay();
        }
      };

      audio.play().catch(() => {
        // Auto-play blocked — user tapped so it should work, but fail gracefully
        audioRef.current = null;
        setPlaying(false);
        callbackRef.current = null;
      });
    },
    [stop],
  );

  return { playing, play, stop };
}
