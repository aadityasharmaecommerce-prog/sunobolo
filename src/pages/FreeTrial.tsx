import { useState, useCallback, useEffect, useRef } from 'react';
import { freeTrialLesson } from '../data/content';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { markSentenceComplete, getProgress } from '../lib/progress';
import Confetti from '../components/Confetti';
import BadgeToast from '../components/BadgeToast';
import { checkAndPersistBadges } from '../lib/badges';
import type { Badge } from '../config/badges';

type Phase = 'listen' | 'speak';

export default function FreeTrial() {
  const [started, setStarted] = useState(false);
  if (!started) return <Landing onStart={() => setStarted(true)} />;
  return <Practice />;
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-full overflow-hidden mb-6 shadow-xl ring-4 ring-brand-100 bg-gradient-to-br from-brand-200 to-accent-200">
        <img
          src="/images/hero.webp"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => {
            const t = e.target as HTMLImageElement;
            t.style.display = 'none';
          }}
        />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900">Free Trial</h1>
      <p className="text-gray-500 mt-2">25 real-life sentences · Hindi meaning · audio ke saath</p>
      <button
        onClick={onStart}
        className="mt-8 bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl text-lg shadow-xl hover:bg-brand-700 active:scale-95 transition-all"
      >
        🎧 Start Free Trial
      </button>
    </div>
  );
}

function Practice() {
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('listen');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [listenCt, setListenCt] = useState(0);
  const [speakCt, setSpeakCt] = useState(0);
  const [finished, setFinished] = useState(false);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);
  const { status, playOnce, listenThreeTimes, playCount, stop } = useSentenceAudio();
  const autoAdvanceRef = useRef(false);
  const mountedRef = useRef(true);
  const listenStartedRef = useRef(false);

  const dismissBadge = useCallback((id: string) => {
    setNewBadges((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const sentences = freeTrialLesson.sentences;
  const total = sentences.length;
  const cur = sentences[idx];

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  const goToIndex = useCallback(
    (nextIdx: number) => {
      stop();
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIdx(nextIdx);
      setPhase('listen');
      setListenCt(0);
      setSpeakCt(0);
      autoAdvanceRef.current = false;
      listenStartedRef.current = false;
    },
    [stop],
  );

  const adv = useCallback(() => {
    if (!cur) return;
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setDone((p) => new Set(p).add(cur.id));
    markSentenceComplete(cur.id, cur.courseId, cur.lessonId, Math.min(idx + 1, total - 1));
    // Check for new badges
    const progress = getProgress();
    const earned = checkAndPersistBadges(progress);
    if (earned.length > 0) setNewBadges((prev) => [...prev, ...earned]);
    if (idx < total - 1) {
      goToIndex(idx + 1);
    } else {
      setFinished(true);
    }
  }, [cur, idx, total, stop, goToIndex]);

  const goBack = useCallback(() => {
    if (idx > 0) goToIndex(idx - 1);
  }, [idx, goToIndex]);

  useEffect(() => {
    if (phase === 'listen' && cur && listenCt === 0 && status === 'idle' && !autoAdvanceRef.current) {
      const t = setTimeout(() => {
        if (mountedRef.current) {
          listenThreeTimes(
            cur.id,
            cur.courseId,
            cur.english,
            setListenCt,
            cur.hindi,
            () => {
              if (mountedRef.current) setPhase('speak');
            },
          );
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, idx, cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === 'listen' && listenCt >= 3) setPhase('speak');
  }, [listenCt, phase]);

  useEffect(() => {
    if (phase === 'speak' && speakCt >= 3 && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current) adv();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [speakCt, phase, adv]);

  const handleManualPlay = useCallback(() => {
    if (!cur) return;
    stop();
    setTimeout(() => {
      if (mountedRef.current && cur) {
        playOnce(cur.id, cur.courseId, cur.english);
      }
    }, 80);
  }, [stop, playOnce, cur]);

  const handleSkipListen = useCallback(() => {
    stop();
    if (mountedRef.current) {
      setPhase('speak');
      setListenCt(3);
    }
  }, [stop]);

  const handleSkipSpeak = useCallback(() => {
    stop();
    if (mountedRef.current) setSpeakCt(3);
  }, [stop]);

  if (finished) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center page-canvas">
        <Confetti />
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-4xl shadow-glow-success animate-float mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900">Trial Complete!</h2>
        <p className="text-gray-500 mt-1.5">Aapne {total} sentences practice kar liye! 👏</p>
        <div className="mt-7 w-full max-w-xs space-y-3">
          <a href="/course/beginner" className="btn-premium btn-premium-gradient w-full py-4 text-sm block text-center">
            🚀 Start Beginner Course
          </a>
          <a href="/courses" className="block w-full bg-white border-2 border-gray-200 text-gray-800 font-bold py-4 rounded-2xl text-center text-sm hover:border-brand-300 transition-colors">
            📚 All Courses
          </a>
        </div>
      </div>
    );
  }

  if (!cur) return null;

  const pct = (done.size / total) * 100;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';

  return (
    <div className="min-h-dvh flex flex-col page-canvas overflow-x-hidden">
      {/* Badge toasts */}
      {newBadges.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 space-y-2">
          {newBadges.map((b) => (
            <BadgeToast key={b.id} badge={b} onDismiss={() => dismissBadge(b.id)} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-between px-5 pt-4 pb-1">
        <button
          onClick={() => { stop(); setFinished(true); }}
          aria-label="Close"
          className="w-9 h-9 rounded-full glass shadow-sm flex items-center justify-center text-base text-gray-500 hover:text-gray-800 transition-colors"
        >
          ✕
        </button>
        <div className="text-center">
          <p className="text-[11px] font-extrabold text-brand-600 uppercase tracking-widest">🎧 Free Trial</p>
          <p className="text-[11px] text-gray-400 font-semibold">{idx + 1} / {total}</p>
        </div>
        <div className="w-9 h-9" />
      </div>

      <div className="mx-5 mt-2 h-2 bg-gray-200/70 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-brand-500 via-accent-500 to-accent-400 rounded-full transition-all duration-500 relative"
          style={{ width: `${Math.max(pct, 3)}%` }}
        >
          <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-accent-500 shadow" />
        </div>
      </div>

      <div className="mx-5 mt-4 flex-1 flex items-start justify-center pt-4">
        <div className="w-full bg-white rounded-[32px] shadow-premium-lg border border-gray-100 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-gradient-to-br from-brand-50 to-accent-50 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-14 -left-14 w-36 h-36 bg-gradient-to-tr from-accent-50 to-brand-50 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <p className="text-[11px] uppercase tracking-[0.22em] text-brand-400 font-extrabold mb-4">
              Sentence {idx + 1} <span className="text-gray-300">of</span> {total}
            </p>
            <p className="text-xl sm:text-2xl font-extrabold leading-snug text-gray-900">
              &ldquo;{cur.english}&rdquo;
            </p>
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-300 font-extrabold mb-2">🇮🇳 Hindi Meaning</p>
              <p className="text-base text-gray-600">{cur.hindi}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-5 mt-auto space-y-3 mb-6">
        {phase === 'listen' && (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                    listenCt >= n
                      ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : isPlaying && playCount === n - 1
                      ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow-brand animate-pulse-soft'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>

            {(isPlaying || isLoading) && (
              <button
                onClick={handleSkipListen}
                className="w-full bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold py-4 rounded-2xl text-base shadow-sm active:scale-[.97] transition-all"
              >
                {isLoading ? '⏳ Loading...' : '⏭ Stop & Next to Speak'}
              </button>
            )}

            {!isPlaying && !isLoading && (
              <button
                onClick={() => {
                  if (listenCt >= 3) {
                    handleManualPlay();
                    return;
                  }
                  listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi, () => {
                    if (mountedRef.current) setPhase('speak');
                  });
                }}
                className="btn-premium btn-premium-gradient w-full py-4 text-base rounded-2xl"
              >
                {listenCt >= 3 ? '🔊 Suno Dobara' : '▶ Suno Aur Bolo'}
              </button>
            )}
          </>
        )}

        {phase === 'speak' && (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-extrabold transition-all duration-300 ${
                    speakCt >= n
                      ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : speakCt === n - 1
                      ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow-brand animate-pulse-soft'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                >
                  {n}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 text-center -mt-1 mb-1">
              Zor se 3 baar bolkar practice karein
            </p>

            {(isPlaying || isLoading) && (
              <button
                onClick={handleSkipSpeak}
                className="w-full bg-amber-100 border-2 border-amber-300 text-amber-800 font-bold py-4 rounded-2xl text-base shadow-sm active:scale-[.97] transition-all"
              >
                {isLoading ? '⏳ Loading...' : '⏭ Stop & Continue'}
              </button>
            )}

            {!isPlaying && !isLoading && (
              <button
                onClick={() => setSpeakCt((p) => Math.min(p + 1, 3))}
                disabled={speakCt >= 3}
                className="btn-premium w-full py-4 rounded-2xl text-base btn-premium-gradient disabled:opacity-60 disabled:saturate-50"
              >
                {speakCt >= 3 ? '✓ Ho Gaya — auto next...' : `🎤 Bol Diya (${speakCt}/3)`}
              </button>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleManualPlay}
                disabled={isPlaying || isLoading}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl text-sm hover:bg-gray-50 active:scale-[.97] transition-all disabled:opacity-50"
              >
                🔊 Suno Dobara
              </button>
              {speakCt >= 3 && !isPlaying && !isLoading && (
                <button
                  onClick={adv}
                  className="flex-[2] bg-brand-600 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-brand-500/30 hover:bg-brand-700 active:scale-[.97] transition-all"
                >
                  Next →
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-400 text-center mt-1">
              {speakCt >= 3 ? '⏳ Agla sentence 1.5s me...' : 'Baar baar zor se bole, confidence badhega!'}
            </p>
          </>
        )}
      </div>

      {/* Bottom Navigation — Back | Counter | Next */}
      <div className="lesson-navigation px-4 pb-5 pt-2">
        <button
          onClick={goBack}
          disabled={idx === 0}
          className="lesson-nav-btn lesson-nav-btn-back"
        >
          ← Back
        </button>
        <div className="lesson-nav-progress">
          <span className="text-xs font-bold text-gray-500 tabular-nums select-none">
            <span className="text-brand-600">{idx + 1}</span>
            <span className="text-gray-300 mx-0.5">/</span>
            {total}
          </span>
        </div>
        <button
          onClick={adv}
          className="lesson-nav-btn lesson-nav-btn-next"
        >
          {idx === total - 1 ? '✓ Finish' : 'Next →'}
        </button>
      </div>
    </div>
  );
}
