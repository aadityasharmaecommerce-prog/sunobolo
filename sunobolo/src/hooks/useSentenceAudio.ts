import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * SunoBolo Audio Engine v7
 *
 * Guarantees:
 * - playFileOnce only settles on ended / error / timeout — NEVER on canplay
 * - Promise ALWAYS settles
 * - Generation token: stop() invalidates every in-flight callback
 * - speechSynthesis.cancel() before every new utterance
 * - English + Hindi + repeats always come from the same sentence object
 */

const BASE_AUDIO = '/audio';
export const getAudioUrl = (sentenceId: string, courseId: string): string =>
  `${BASE_AUDIO}/${courseId}/${sentenceId}.mp3`;

export function getAudioUrlStatic(sentenceId: string, courseId: string): string {
  return getAudioUrl(sentenceId, courseId);
}

export interface PracticeSentence {
  id: string;
  courseId: string;
  english: string;
  hindi: string;
}

type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';

const PLAYBACK_TIMEOUT_MS = 30_000;
const REPEAT_GAP_MS = 700;

let bestEnVoice: SpeechSynthesisVoice | null = null;
let bestHiVoice: SpeechSynthesisVoice | null = null;

const pickVoice = (prefer: string[]): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  for (const lang of prefer) {
    const match = voices.find((v) => v.lang?.toLowerCase().startsWith(lang));
    if (match) return match;
  }
  return voices[0] ?? null;
};

const ensureVoices = () => {
  if (!bestEnVoice) bestEnVoice = pickVoice(['en-in', 'en-gb', 'en-au', 'en-us', 'en']);
  if (!bestHiVoice) bestHiVoice = pickVoice(['hi-in', 'hi']);
};

const fileExistsCache = new Map<string, boolean>();

async function checkFileExists(url: string): Promise<boolean> {
  if (fileExistsCache.has(url)) return fileExistsCache.get(url) === true;
  try {
    const res = await fetch(url, { method: 'HEAD' });
    const exists = res.ok;
    fileExistsCache.set(url, exists);
    return exists;
  } catch {
    fileExistsCache.set(url, false);
    return false;
  }
}

function cleanupAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.oncanplay = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  } catch {
    /* ignore */
  }
}

export function useSentenceAudio() {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [playCount, setPlayCount] = useState(0);

  const genRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const isLive = (gen: number) => gen === genRef.current;

  const stop = useCallback(() => {
    genRef.current += 1;
    clearTimers();
    cleanupAudio(audioRef.current);
    audioRef.current = null;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch {
      /* ignore */
    }
    setStatus('idle');
    setPlayCount(0);
  }, []);

  const speakTTS = useCallback((text: string, lang: 'en' | 'hi', myGen: number): Promise<void> => {
    return new Promise((resolve) => {
      if (!isLive(myGen)) {
        resolve();
        return;
      }
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        resolve();
        return;
      }
      ensureVoices();
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      const utt = new SpeechSynthesisUtterance(text);
      if (lang === 'hi') {
        utt.lang = bestHiVoice?.lang || 'hi-IN';
        if (bestHiVoice) utt.voice = bestHiVoice;
        utt.rate = 0.95;
      } else {
        utt.lang = bestEnVoice?.lang || 'en-IN';
        if (bestEnVoice) utt.voice = bestEnVoice;
        utt.rate = 0.88;
      }
      utt.pitch = 1;
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        if (isLive(myGen)) setStatus('idle');
        resolve();
      };
      utt.onend = finish;
      utt.onerror = finish;
      const t = window.setTimeout(finish, Math.min(PLAYBACK_TIMEOUT_MS, Math.max(4000, text.length * 90)));
      timersRef.current.push(t);
      if (isLive(myGen)) setStatus('playing');
      try {
        window.speechSynthesis.speak(utt);
      } catch {
        finish();
      }
    });
  }, []);

  /**
   * Play an MP3 once. Promise always settles.
   * `settled` is ONLY flipped inside finish() — never on canplay / play().
   */
  const playFileOnce = useCallback((url: string, myGen: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isLive(myGen)) {
        resolve(false);
        return;
      }
      cleanupAudio(audioRef.current);
      audioRef.current = null;

      const audio = new Audio();
      audioRef.current = audio;
      setStatus('loading');
      let settled = false;

      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (audioRef.current === audio) audioRef.current = null;
        cleanupAudio(audio);
        if (isLive(myGen)) setStatus('idle');
        resolve(ok);
      };

      const safetyTimer = window.setTimeout(() => {
        if (!settled) finish(false);
      }, PLAYBACK_TIMEOUT_MS);
      timersRef.current.push(safetyTimer);

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.oncanplay = () => {
        if (settled || !isLive(myGen)) {
          finish(false);
          return;
        }
        audio.play().then(() => {
          if (settled || !isLive(myGen)) {
            try {
              audio.pause();
            } catch {
              /* ignore */
            }
            if (!settled) finish(false);
            return;
          }
          // Still playing — wait for onended. Do NOT mark settled here.
          setStatus('playing');
        }).catch(() => finish(false));
      };

      audio.src = url;
      audio.load();
    });
  }, []);

  const playEnglish = useCallback(
    async (sentence: PracticeSentence, myGen: number): Promise<boolean> => {
      if (!isLive(myGen)) return false;
      const url = getAudioUrl(sentence.id, sentence.courseId);
      const exists = await checkFileExists(url);
      if (!isLive(myGen)) return false;
      if (exists) {
        const ok = await playFileOnce(url, myGen);
        if (ok || !isLive(myGen)) return ok;
      }
      await speakTTS(sentence.english, 'en', myGen);
      return isLive(myGen);
    },
    [playFileOnce, speakTTS],
  );

  /** Play the current sentence's English once (MP3 or TTS). */
  const playOnce = useCallback(
    async (sentenceId: string, courseId: string, english: string, onEnd?: () => void) => {
      stop();
      const myGen = genRef.current;
      const sentence: PracticeSentence = { id: sentenceId, courseId, english, hindi: '' };
      await playEnglish(sentence, myGen);
      if (isLive(myGen)) onEnd?.();
    },
    [stop, playEnglish],
  );

  /**
   * Suno Aur Bolo guided flow for ONE sentence:
   *   English
   *   "मतलब {hindi}"
   *   "मेरे साथ 3 बार रिपीट करो।"
   *   English  ×3 with pauses
   */
  const listenThreeTimes = useCallback(
    async (
      sentenceId: string,
      courseId: string,
      english: string,
      onProgress?: (count: number) => void,
      hindi?: string,
      onComplete?: () => void,
    ) => {
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      try {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
      } catch {
        /* ignore */
      }
      const myGen = ++genRef.current;
      clearTimers();
      setPlayCount(0);
      setStatus('idle');

      const sentence: PracticeSentence = {
        id: sentenceId,
        courseId,
        english,
        hindi: hindi ?? '',
      };

      // Intro: English + Hindi meaning + instruction
      await playEnglish(sentence, myGen);
      if (!isLive(myGen)) return;

      if (sentence.hindi) {
        await speakTTS(`मतलब ${sentence.hindi}`, 'hi', myGen);
        if (!isLive(myGen)) return;
      }

      await speakTTS('मेरे साथ 3 बार रिपीट करो।', 'hi', myGen);
      if (!isLive(myGen)) return;

      for (let i = 0; i < 3; i++) {
        if (!isLive(myGen)) return;
        await playEnglish(sentence, myGen);
        if (!isLive(myGen)) return;
        const count = i + 1;
        setPlayCount(count);
        onProgress?.(count);
        if (i < 2) {
          await new Promise<void>((resolve) => {
            const t = window.setTimeout(resolve, REPEAT_GAP_MS);
            timersRef.current.push(t);
          });
        }
      }

      if (isLive(myGen)) {
        setStatus('idle');
        onComplete?.();
      }
    },
    [playEnglish, speakTTS],
  );

  useEffect(() => {
    ensureVoices();
    const onVoices = () => {
      bestEnVoice = null;
      bestHiVoice = null;
      ensureVoices();
    };
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    }
    return () => {
      genRef.current += 1;
      clearTimers();
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
          window.speechSynthesis.cancel();
        }
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { status, playCount, playOnce, listenThreeTimes, stop };
}
