import { useRef, useCallback, useState, useEffect } from 'react';
import {
  AUDIO_PATHS,
  HINDI_MEANING_PREFIX,
  PRACTICE_TIMING,
  PRACTICE_VOICE,
  REPEAT_INSTRUCTION_TEXT,
  SPEECH_RATE,
  pickPracticeVoice,
  resetPracticeVoiceCache,
} from '../config/voiceConfig';

/**
 * SunoBolo Audio Engine v9 — patient teacher flow with proper pacing.
 *
 * Voice architecture:
 * - English sentence  → MP3 pre-generated with hi-IN-SwaraNeural (Azure)
 * - Hindi meaning     → MP3 pre-generated with the SAME voice
 * - "3 बार रिपीट"    → MP3 pre-generated with the SAME voice
 * - 3 repetitions     → the SAME English MP3 replayed → identical voice
 *
 * Browser TTS is ONLY a fallback (missing/blocked MP3) and uses ONE single
 * bilingual voice for every language — never an English/Hindi voice pair.
 *
 * Flow with pauses:
 *   English (complete) → 1.5s pause → Hindi (complete) → 1.5s pause →
 *   Instruction (complete) → 2s pause → English rep 1 → 2.5s pause →
 *   English rep 2 → 2.5s pause → English rep 3 → COMPLETE
 *
 * Guarantees:
 * - playFileOnly settles ONLY on audio.onended / error / timeout — NEVER on canplay
 * - Promise ALWAYS settles
 * - Generation token: stop() / new sentence invalidates in-flight callbacks
 * - speechSynthesis.cancel() before EVERY new utterance (not just once)
 * - Next/Back sentence always STOPS the current sentence's audio (gen bump)
 * - Complete sentence is ALWAYS used — no substring/slice/truncation
 */

export interface PracticeSentence {
  id: string;
  courseId: string;
  english: string;
  hindi: string;
}

type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';

/** Safety timeout — if audio somehow never ends, we don't hang forever. */
const PLAYBACK_TIMEOUT_MS = 30_000;

/** Detect iOS Safari — cannot reliably create new Audio() elements mid-flow. */
const IS_IOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (typeof navigator !== 'undefined' && navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

let fileExistsCache = new Map<string, boolean>();

// Clear file existence cache on app load to ensure fresh checks
try {
  const storedVersion = localStorage.getItem('sb_audio_version');    const currentVersion = '22';
  if (storedVersion !== currentVersion) {
    fileExistsCache = new Map<string, boolean>();
    localStorage.setItem('sb_audio_version', currentVersion);
  }
} catch { /* ignore */ }

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

/** Cancel any running TTS safely. */
function cancelTTS() {
  try {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
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
  /** iOS: reused Audio element created during user gesture, persists across the entire flow. */
  const sharedAudioRef = useRef<HTMLAudioElement | null>(null);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  const isLive = (gen: number) => gen === genRef.current;

  /** Pause helper — uses a generation-safe timeout. */
  const pause = useCallback(
    (ms: number, myGen: number): Promise<void> =>
      new Promise((resolve) => {
        if (!isLive(myGen)) {
          resolve();
          return;
        }
        const t = window.setTimeout(() => {
          if (isLive(myGen)) resolve();
          else resolve();
        }, ms);
        timersRef.current.push(t);
      }),
    [],
  );

  const stop = useCallback(() => {
    genRef.current += 1;
    clearTimers();
    cleanupAudio(audioRef.current);
    audioRef.current = null;
    // iOS: also stop the shared element but don't null it — it survives across the flow
    if (sharedAudioRef.current) {
      try {
        sharedAudioRef.current.oncanplay = null;
        sharedAudioRef.current.onended = null;
        sharedAudioRef.current.onerror = null;
        sharedAudioRef.current.pause();
      } catch { /* ignore */ }
    }
    cancelTTS();
    setStatus('idle');
    setPlayCount(0);
  }, []);

  /**
   * TTS fallback — ONE voice for every language.
   * Uses SPEECH_RATE from config (0.82) for beginner-friendly speed.
   * Always calls speechSynthesis.cancel() before starting a new utterance.
   */
  const speakTTS = useCallback(
    (text: string, hint: 'en-IN' | 'hi-IN', myGen: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!isLive(myGen)) {
          resolve();
          return;
        }
        if (typeof window === 'undefined' || !window.speechSynthesis) {
          resolve();
          return;
        }
        // Always cancel before speaking — prevents overlap
        cancelTTS();
        const utt = new SpeechSynthesisUtterance(text);
        const voice = pickPracticeVoice();
        if (voice) {
          // Lock the SAME voice (and its language) for all text —
          // a hi-IN voice reads English with a natural Indian accent.
          utt.voice = voice;
          utt.lang = voice.lang;
        } else {
          // Last resort only: no voice list available yet.
          utt.lang = hint;
        }
        utt.rate = SPEECH_RATE;
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
        const t = window.setTimeout(
          finish,
          Math.min(PLAYBACK_TIMEOUT_MS, Math.max(4000, text.length * 120)),
        );
        timersRef.current.push(t);
        if (isLive(myGen)) setStatus('playing');
        try {
          window.speechSynthesis.speak(utt);
        } catch {
          finish();
        }
      });
    },
    [],
  );

  /**
   * Play an MP3 once. Promise settles ONLY on audio.onended / error / timeout.
   * Never settles on canplay — that would be premature.
   *
   * iOS Safari fix: Reuses a single Audio element across the entire guided flow.
   * On iOS, creating new Audio() after the initial user gesture loses the gesture
   * context and audio.play() silently rejects. By reusing the element created during
   * the first user gesture, iOS permits subsequent play() calls in the same chain.
   */
  const playFileOnce = useCallback((url: string, myGen: number): Promise<boolean> => {
    return new Promise((resolve) => {
      if (!isLive(myGen)) {
        resolve(false);
        return;
      }
      cleanupAudio(audioRef.current);
      audioRef.current = null;

      // iOS: reuse the shared Audio element to preserve user-gesture context.
      // Desktop/Android: also benefit from element reuse (fewer GC pauses).
      let audio: HTMLAudioElement;
      if (IS_IOS && sharedAudioRef.current) {
        audio = sharedAudioRef.current;
        // Fully reset the element for a new src
        try {
          audio.oncanplay = null;
          audio.onended = null;
          audio.onerror = null;
          audio.pause();
          audio.removeAttribute('src');
          audio.load();
        } catch { /* ignore */ }
      } else {
        audio = new Audio();
        if (IS_IOS) sharedAudioRef.current = audio;
      }
      audioRef.current = audio;
      setStatus('loading');
      let settled = false;

      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        if (audioRef.current === audio) audioRef.current = null;
        // iOS shared element: DON'T destroy it — keep alive for next play
        if (!(IS_IOS && audio === sharedAudioRef.current)) {
          cleanupAudio(audio);
        } else {
          try {
            audio.oncanplay = null;
            audio.onended = null;
            audio.onerror = null;
            audio.pause();
          } catch { /* ignore */ }
        }
        if (isLive(myGen)) setStatus('idle');
        resolve(ok);
      };

      const safetyTimer = window.setTimeout(() => {
        if (!settled) finish(false);
      }, PLAYBACK_TIMEOUT_MS);
      timersRef.current.push(safetyTimer);

      // Wait for onended — NOT oncanplay
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.oncanplay = () => {
        if (settled || !isLive(myGen)) {
          finish(false);
          return;
        }
        // On iOS, call play() and handle the Promise — never assume it succeeds.
        const playPromise = audio.play();
        if (playPromise) {
          playPromise.then(() => {
            if (settled || !isLive(myGen)) {
              try { audio.pause(); } catch { /* ignore */ }
              if (!settled) finish(false);
              return;
            }
            setStatus('playing');
          }).catch(() => {
            // iOS: play() rejected — retry once after a brief pause.
            // This handles the case where iOS needs a micro-task to settle.
            if (settled || !isLive(myGen)) { finish(false); return; }
            const retryTimer = window.setTimeout(() => {
              if (settled || !isLive(myGen)) { finish(false); return; }
              audio.play().then(() => {
                if (!settled && isLive(myGen)) setStatus('playing');
              }).catch(() => finish(false));
            }, 150);
            timersRef.current.push(retryTimer);
          });
        } else {
          // Fallback for browsers that don't return a Promise from play()
          setStatus('playing');
        }
      };

      audio.src = url;
      audio.load();
    });
  }, []);

  /** MP3 first, then ONE-voice TTS fallback. */
  const playMp3OrTts = useCallback(
    async (
      url: string,
      text: string,
      hint: 'en-IN' | 'hi-IN',
      myGen: number,
    ): Promise<boolean> => {
      if (!isLive(myGen)) return false;
      const exists = await checkFileExists(url);
      if (!isLive(myGen)) return false;
      if (exists) {
        const ok = await playFileOnce(url, myGen);
        if (ok || !isLive(myGen)) return ok;
      }
      // TTS fallback — use complete text, never truncated
      await speakTTS(text, hint, myGen);
      return isLive(myGen);
    },
    [playFileOnce, speakTTS],
  );

  /** English sentence — same voice as every other part of the flow. */
  const playEnglish = useCallback(
    async (sentence: PracticeSentence, myGen: number): Promise<boolean> => {
      const url = AUDIO_PATHS.english(sentence.courseId, sentence.id);
      return playMp3OrTts(url, sentence.english, 'en-IN', myGen);
    },
    [playMp3OrTts],
  );

  /** Hindi meaning — MP3 generated with the SAME voice as English. */
  const playHindiMeaning = useCallback(
    async (sentence: PracticeSentence, myGen: number): Promise<boolean> => {
      if (!sentence.hindi) return isLive(myGen);
      const url = AUDIO_PATHS.hindi(sentence.courseId, sentence.id);
      const text = `${HINDI_MEANING_PREFIX} ${sentence.hindi}`;
      return playMp3OrTts(url, text, 'hi-IN', myGen);
    },
    [playMp3OrTts],
  );

  /** Instruction "मेरे साथ 3 बार रिपीट करो।" — same voice MP3. */
  const playInstruction = useCallback(
    async (myGen: number): Promise<boolean> => {
      return playMp3OrTts(
        AUDIO_PATHS.instruction,
        REPEAT_INSTRUCTION_TEXT,
        'hi-IN',
        myGen,
      );
    },
    [playMp3OrTts],
  );

  /** Play the current sentence's English once (MP3 or TTS). Used by "Suno Dobara". */
  const playOnce = useCallback(
    async (
      sentenceId: string,
      courseId: string,
      english: string,
      onEnd?: () => void,
    ) => {
      stop();
      const myGen = genRef.current;
      const sentence: PracticeSentence = {
        id: sentenceId,
        courseId,
        english,
        hindi: '',
      };
      await playEnglish(sentence, myGen);
      if (isLive(myGen)) onEnd?.();
    },
    [stop, playEnglish],
  );

  /**
   * Suno Aur Bolo guided flow for ONE sentence — ONE voice throughout:
   *
   *   English (complete)           → 1.5s pause
   *   "मतलब {hindi}" (complete)   → 1.5s pause
   *   "मेरे साथ 3 बार रिपीट"      → 2.0s pause
   *   English rep 1 (complete)     → 2.5s pause
   *   English rep 2 (complete)     → 2.5s pause
   *   English rep 3 (complete)     → DONE
   *
   * The COMPLETE sentence is spoken EVERY TIME — no truncation.
   * Each segment waits for its audio to fully finish before the next pause.
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
      // Cancel everything from previous sentence
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      cancelTTS();
      clearTimers();

      const myGen = ++genRef.current;
      setPlayCount(0);
      setStatus('idle');

      const sentence: PracticeSentence = {
        id: sentenceId,
        courseId,
        english,
        hindi: hindi ?? '',
      };

      // ── Step 1: English sentence (complete) ──
      await playEnglish(sentence, myGen);
      if (!isLive(myGen)) return;

      // ── Pause: English → Hindi ──
      await pause(PRACTICE_TIMING.englishToHindi, myGen);
      if (!isLive(myGen)) return;

      // ── Step 2: Hindi meaning (complete) ──
      if (sentence.hindi) {
        // Cancel any lingering TTS before Hindi segment
        cancelTTS();
        await playHindiMeaning(sentence, myGen);
        if (!isLive(myGen)) return;

        // ── Pause: Hindi → Instruction ──
        await pause(PRACTICE_TIMING.hindiToInstruction, myGen);
        if (!isLive(myGen)) return;
      }

      // ── Step 3: Instruction (complete) ──
      cancelTTS();
      await playInstruction(myGen);
      if (!isLive(myGen)) return;

      // ── Pause: Instruction → Repetition 1 ──
      await pause(PRACTICE_TIMING.instructionToRepeat, myGen);
      if (!isLive(myGen)) return;

      // ── Steps 4-6: 3 English repetitions (complete each time) ──
      for (let i = 0; i < 3; i++) {
        if (!isLive(myGen)) return;

        // Cancel TTS before each repetition to prevent overlap
        cancelTTS();
        await playEnglish(sentence, myGen);
        if (!isLive(myGen)) return;

        const count = i + 1;
        setPlayCount(count);
        onProgress?.(count);

        // Pause between repetitions (but not after the last one)
        if (i < 2) {
          await pause(PRACTICE_TIMING.betweenRepeats, myGen);
        }
      }

      if (isLive(myGen)) {
        setStatus('idle');
        onComplete?.();
      }
    },
    [playEnglish, playHindiMeaning, playInstruction, pause],
  );

  useEffect(() => {
    const onVoices = () => resetPracticeVoiceCache();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.addEventListener('voiceschanged', onVoices);
    }
    return () => {
      genRef.current += 1;
      clearTimers();
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      // iOS: also clean up the shared element on unmount
      if (sharedAudioRef.current) {
        try {
          sharedAudioRef.current.oncanplay = null;
          sharedAudioRef.current.onended = null;
          sharedAudioRef.current.onerror = null;
          sharedAudioRef.current.pause();
          sharedAudioRef.current.removeAttribute('src');
          sharedAudioRef.current.load();
        } catch { /* ignore */ }
        sharedAudioRef.current = null;
      }
      cancelTTS();
      try {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
          window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
        }
      } catch {
        /* ignore */
      }
    };
  }, []);

  return { status, playCount, playOnce, listenThreeTimes, stop };
}

// Re-exported for any consumer that needs the canonical paths/voice.
export { AUDIO_PATHS, PRACTICE_VOICE, REPEAT_INSTRUCTION_TEXT };
