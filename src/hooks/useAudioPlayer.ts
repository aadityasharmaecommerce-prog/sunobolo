import { useCallback, useRef, useState } from 'react';

export interface GuidedSentence {
  id: string;
  english: string;
  hindi: string;
}

/**
 * Plays a voice-pack MP3 (served from /audio/{sentenceId}.mp3).
 * Falls back to browser TTS if the file is missing.
 *
 * Race-safe:
 *   - play().catch and onerror cannot both fire the caller callback
 *   - a generation token invalidates stale handlers after stop()/new play()
 *   - missing MP3 still increments listen count via TTS fallback
 */
export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const genRef = useRef(0);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const hardStopMedia = () => {
    if (audioRef.current) {
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load();
      audioRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    clearTimers();
  };

  const stop = useCallback(() => {
    genRef.current += 1;
    hardStopMedia();
    setPlaying(false);
  }, []);

  const speakTTS = useCallback((text: string, lang: 'en' | 'hi', myGen: number): Promise<void> => {
    return new Promise((resolve) => {
      if (myGen !== genRef.current) {
        resolve();
        return;
      }
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utter.rate = lang === 'hi' ? 0.95 : 0.92;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      utter.onend = finish;
      utter.onerror = finish;
      const t = window.setTimeout(finish, Math.min(20000, Math.max(3500, text.length * 90)));
      timersRef.current.push(t);
      try {
        window.speechSynthesis.speak(utter);
      } catch {
        finish();
      }
    });
  }, []);

  const playEnglishOnce = useCallback((sentenceId: string, english: string, myGen: number): Promise<void> => {
    return new Promise((resolve) => {
      if (myGen !== genRef.current) {
        resolve();
        return;
      }
      hardStopMedia();
      setPlaying(true);

      const mp3Url = `/audio/${sentenceId}.mp3`;
      const audio = new Audio(mp3Url);
      audioRef.current = audio;
      let settled = false;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (audioRef.current === audio) {
          audio.onended = null;
          audio.onerror = null;
          audioRef.current = null;
        }
        resolve();
      };

      audio.onended = () => finish();

      audio.onerror = () => {
        if (settled || myGen !== genRef.current) {
          finish();
          return;
        }
        audio.onended = null;
        audio.onerror = null;
        if (audioRef.current === audio) audioRef.current = null;
        // TTS fallback — still counts as a completed play
        void speakTTS(english, 'en', myGen).then(finish);
      };

      audio.play().catch(() => {
        // Autoplay blocked OR media error. onerror may also fire.
        // If onerror already started TTS, finish() is idempotent.
        if (settled) return;
        if (myGen !== genRef.current) {
          finish();
          return;
        }
        // Give onerror a tick to claim the failure; otherwise TTS here.
        window.setTimeout(() => {
          if (settled || myGen !== genRef.current) return;
          void speakTTS(english, 'en', myGen).then(finish);
        }, 40);
      });
    });
  }, [speakTTS]);

  const play = useCallback(
    (sentenceId: string, english: string, onPlayEnd?: () => void) => {
      stop();
      const myGen = genRef.current;
      setPlaying(true);
      void playEnglishOnce(sentenceId, english, myGen).then(() => {
        if (myGen !== genRef.current) return;
        setPlaying(false);
        onPlayEnd?.();
      });
    },
    [stop, playEnglishOnce],
  );

  /** Guided Suno Aur Bolo: English + मतलब Hindi + instruction + English ×3 */
  const playGuided = useCallback(
    (sentence: GuidedSentence, onProgress?: (n: number) => void, onComplete?: () => void) => {
      stop();
      const myGen = genRef.current;
      setPlaying(true);

      void (async () => {
        await playEnglishOnce(sentence.id, sentence.english, myGen);
        if (myGen !== genRef.current) return;
        if (sentence.hindi) {
          await speakTTS(`मतलब ${sentence.hindi}`, 'hi', myGen);
          if (myGen !== genRef.current) return;
        }
        await speakTTS('मेरे साथ 3 बार रिपीट करो।', 'hi', myGen);
        if (myGen !== genRef.current) return;

        for (let i = 0; i < 3; i++) {
          if (myGen !== genRef.current) return;
          await playEnglishOnce(sentence.id, sentence.english, myGen);
          if (myGen !== genRef.current) return;
          onProgress?.(i + 1);
          if (i < 2) {
            await new Promise<void>((r) => {
              const t = window.setTimeout(r, 700);
              timersRef.current.push(t);
            });
          }
        }
        if (myGen !== genRef.current) return;
        setPlaying(false);
        onComplete?.();
      })();
    },
    [stop, playEnglishOnce, speakTTS],
  );

  return { playing, play, playGuided, stop };
}
