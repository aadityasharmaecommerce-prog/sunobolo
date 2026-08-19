import { useRef, useCallback, useState, useEffect } from 'react';

/**
 * SunoBolo Audio Engine - v6 (bulletproof)
 *
 * v6 fixes:
 * - listenThreeTimes now cleans up old audio at start (prevents ghost audio)
 * - playFileOnce settled flag set before onended can fire
 * - Safety timeout: force-stop after 30 seconds
 * - All functions properly clean up previous audio
 */

const BASE_AUDIO = '/audio';
const getAudioUrl = (sid: string, cid: string): string =>
  `${BASE_AUDIO}/${cid}/${sid}.mp3`;

type AudioStatus = 'idle' | 'loading' | 'playing' | 'error';

// Safety timeout: force-stop after 30 seconds of playback
const PLAYBACK_TIMEOUT_MS = 30_000;

// Cached best voice
let bestVoice: SpeechSynthesisVoice | null = null;

const pickBestVoice = (): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;
  const score = (v: SpeechSynthesisVoice): number => {
    const lang = v.lang.toLowerCase();
    let s = 0;
    if (lang.includes('en-in')) s += 100;
    else if (lang.includes('en-gb')) s += 50;
    else if (lang.includes('en-au')) s += 30;
    else if (lang.includes('en-us')) s += 10;
    if (v.name.toLowerCase().includes('female')) s += 5;
    if (v.default) s += 2;
    if (v.localService) s += 1;
    return s;
  };
  return [...voices].sort((a, b) => score(b) - score(a))[0] || null;
};

const ensureVoice = () => {
  if (!bestVoice) bestVoice = pickBestVoice();
};

// Track file existence cache - avoid HEAD for every play
const fileExistsCache = new Map<string, boolean>();

export function getAudioUrlStatic(sentenceId: string, courseId: string): string {
  return getAudioUrl(sentenceId, courseId);
}

async function checkFileExists(url: string): Promise<boolean> {
  if (fileExistsCache.has(url)) {
    return fileExistsCache.get(url) === true;
  }
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

/** Clean up an audio element safely */
function cleanupAudio(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    audio.oncanplay = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute('src');
    audio.load();
  } catch { /* ignore */ }
}

export function useSentenceAudio() {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [playCount, setPlayCount] = useState(0);

  // Playback generation token - bumps on every stop, stale callbacks no-op
  const genRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ttsUttRef = useRef<SpeechSynthesisUtterance | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  // FULL STOP: cancel audio element, cancel any TTS, invalidate token
  const stop = useCallback(() => {
    genRef.current++; // invalidate all in-flight callbacks
    clearTimers();
    cleanupAudio(audioRef.current);
    audioRef.current = null;
    try {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    } catch { /* ignore */ }
    ttsUttRef.current = null;
    setStatus('idle');
    setPlayCount(0);
  }, []);

  // Speak text via TTS (only fires when MP3 file is missing)
  const speakViaTTS = useCallback((text: string, onEnd?: () => void) => {
    const myGen = genRef.current;
    if (!window.speechSynthesis) {
      setStatus('idle');
      onEnd?.();
      return;
    }
    ensureVoice();
    try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = bestVoice?.lang || 'en-US';
    utt.rate = 0.85;
    utt.pitch = 1;
    if (bestVoice) utt.voice = bestVoice;
    ttsUttRef.current = utt;
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      ttsUttRef.current = null;
      if (myGen === genRef.current) {
        setStatus('idle');
        onEnd?.();
      }
    };
    utt.onstart = () => { if (myGen === genRef.current) setStatus('playing'); };
    utt.onend = finish;
    utt.onerror = finish;
    // Safety timeout for TTS
    const t = window.setTimeout(finish, PLAYBACK_TIMEOUT_MS);
    timersRef.current.push(t);
    try { window.speechSynthesis.speak(utt); } catch { finish(); }
  }, []);

  // Play MP3 once - with safety timeout and robust error handling
  const playFileOnce = useCallback((url: string, myGen: number, onEnd?: () => void): Promise<boolean> => {
    return new Promise((resolve) => {
      // Reset any previous audio
      cleanupAudio(audioRef.current);
      audioRef.current = null;

      const audio = new Audio();
      audioRef.current = audio;
      setStatus('loading');
      let settled = false;

      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        // Cleanup
        if (audioRef.current === audio) audioRef.current = null;
        cleanupAudio(audio);
        // Only update status if generation hasn't changed
        if (myGen === genRef.current) {
          setStatus('idle');
          if (ok) onEnd?.();
        }
        resolve(ok);
      };

      // Safety timeout: force stop if onended never fires
      const safetyTimer = window.setTimeout(() => {
        if (!settled) {
          console.warn('[Audio] Safety timeout - forcing stop after', PLAYBACK_TIMEOUT_MS, 'ms');
          finish(false);
        }
      }, PLAYBACK_TIMEOUT_MS);
      timersRef.current.push(safetyTimer);

      audio.oncanplay = () => {
        if (settled || myGen !== genRef.current) return;
        audio.play().then(() => {
          if (settled || myGen !== genRef.current) return;
          settled = true; // Mark settled here to prevent onended double-call issues
          setStatus('playing');
          // Don't resolve yet - wait for onended
        }).catch(() => finish(false));
      };
      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);
      audio.src = url;
      audio.load();
    });
  }, []);

  // Play exact sentence: premium file if exists, else TTS - never BOTH
  const playOnce = useCallback(
    async (sentenceId: string, courseId: string, english: string, onEnd?: () => void) => {
      stop();
      const myGen = genRef.current;
      const url = getAudioUrl(sentenceId, courseId);
      const exists = await checkFileExists(url);
      if (myGen !== genRef.current) return;
      if (exists) {
        await playFileOnce(url, myGen, onEnd);
      } else {
        speakViaTTS(english, onEnd);
      }
    },
    [stop, playFileOnce, speakViaTTS]
  );

  // Listen 3 times - CRITICAL FIX: cleanup old audio at start
  const listenThreeTimes = useCallback(
    async (sentenceId: string, courseId: string, english: string, onProgress?: (count: number) => void) => {
      // 🔑 KEY FIX: Stop any previously playing audio FIRST
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}
      ttsUttRef.current = null;

      const myGen = ++genRef.current;
      clearTimers();
      setPlayCount(0);
      setStatus('idle');

      const url = getAudioUrl(sentenceId, courseId);
      const exists = await checkFileExists(url);
      if (myGen !== genRef.current) return;

      let count = 0;

      const playOneFile = (onDone: () => void): void => {
        if (myGen !== genRef.current) { onDone(); return; }
        cleanupAudio(audioRef.current);
        audioRef.current = null;

        const audio = new Audio();
        audioRef.current = audio;
        let settled = false;

        const finish = () => {
          if (settled) return;
          settled = true;
          if (audioRef.current === audio) audioRef.current = null;
          cleanupAudio(audio);
          onDone();
        };

        // Safety timeout
        const t = window.setTimeout(() => {
          if (!settled) {
            console.warn('[Audio:listen3x] Safety timeout');
            finish();
          }
        }, PLAYBACK_TIMEOUT_MS);
        timersRef.current.push(t);

        audio.oncanplay = () => {
          if (settled || myGen !== genRef.current) return;
          audio.play().then(() => {
            if (settled || myGen !== genRef.current) return;
            setStatus('playing');
          }).catch(() => finish());
        };
        audio.onended = finish;
        audio.onerror = finish;
        audio.src = url;
        audio.load();
      };

      const playOneTTS = (onDone: () => void): void => {
        if (myGen !== genRef.current) { onDone(); return; }
        ensureVoice();
        try { window.speechSynthesis.cancel(); } catch { /* ignore */ }
        const utt = new SpeechSynthesisUtterance(english);
        utt.lang = bestVoice?.lang || 'en-US';
        utt.rate = 0.85;
        if (bestVoice) utt.voice = bestVoice;
        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          onDone();
        };
        utt.onstart = () => { if (myGen === genRef.current) setStatus('playing'); };
        utt.onend = finish;
        utt.onerror = finish;
        // Safety timeout for TTS
        const t = window.setTimeout(finish, PLAYBACK_TIMEOUT_MS);
        timersRef.current.push(t);
        try { window.speechSynthesis.speak(utt); } catch { finish(); }
      };

      const step = () => {
        if (myGen !== genRef.current) return;
        if (count >= 3) { setStatus('idle'); return; }
        const onDone = () => {
          if (myGen !== genRef.current) return;
          count++;
          setPlayCount(count);
          onProgress?.(count);
          if (count < 3) {
            const t = window.setTimeout(step, 400);
            timersRef.current.push(t);
          } else {
            setStatus('idle');
          }
        };
        if (exists) playOneFile(onDone);
        else playOneTTS(onDone);
      };
      step();
    },
    []
  );

  // Initialize voice cache on mount
  useEffect(() => {
    ensureVoice();
    return () => {
      genRef.current++;
      clearTimers();
      cleanupAudio(audioRef.current);
      audioRef.current = null;
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch {}
    };
  }, []);

  return { status, playCount, playOnce, listenThreeTimes, stop };
}
