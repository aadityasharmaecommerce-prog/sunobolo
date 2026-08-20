import { useState, useCallback, useEffect, useRef } from 'react';
import { freeTrialLesson } from '../data/content';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { markSentenceComplete, getProgress } from '../lib/progress';
import Confetti from '../components/Confetti';
import BadgeToast from '../components/BadgeToast';
import { checkAndPersistBadges } from '../lib/badges';
import type { Badge } from '../config/badges';

type Phase = 'listen' | 'speak';

/* ── Waveform ── */
function Waveform({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="flex items-center justify-center gap-[3px] h-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="waveform-bar bg-brand-400" />
      ))}
    </div>
  );
}

/* ── Step Indicator ── */
function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Listen', done: step > 1 },
    { n: 2, label: 'Speak', done: step > 2 },
    { n: 3, label: 'Next', done: false },
  ];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-1.5 sm:gap-2">
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
            s.n === step && !s.done ? 'bg-brand-100 text-brand-700 step-active'
            : s.done ? 'bg-success-100 text-success-700'
            : 'bg-gray-100 text-gray-400'
          }`}>
            {s.done ? <span className="text-[10px]">✓</span> : <span className="text-[10px]">{s.n}</span>}
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <span className={`text-[10px] ${s.done ? 'text-success-400' : 'text-gray-300'}`}>→</span>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FreeTrial() {
  const [started, setStarted] = useState(false);
  if (!started) return <Landing onStart={() => setStarted(true)} />;
  return <Practice />;
}

function Landing({ onStart }: { onStart: () => void }) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-24 rounded-3xl overflow-hidden mb-6 shadow-xl ring-4 ring-brand-100 bg-gradient-to-br from-brand-200 to-accent-200">
        <img
          src="/images/hero.webp"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>
      <h1 className="text-3xl font-extrabold text-gray-900">Free Trial</h1>
      <p className="text-gray-500 mt-2 text-sm max-w-xs">
        25 real-life sentences with Hindi meaning and natural audio
      </p>
      <div className="mt-6 flex items-center gap-3 text-[11px] text-gray-400 font-medium">
        <span>🎧 Listen 3×</span>
        <span>·</span>
        <span>🎤 Speak 3×</span>
        <span>·</span>
        <span>✓ Next</span>
      </div>
      <button
        onClick={onStart}
        className="mt-8 btn-premium btn-premium-gradient px-10 py-4 rounded-2xl text-base shadow-xl"
      >
        🎧 Start Free Trial
      </button>
      <p className="text-[11px] text-gray-400 mt-3">No login · No payment · Full experience</p>
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

  const sentences = freeTrialLesson.sentences;
  const total = sentences.length;
  const cur = sentences[idx];

  const dismissBadge = useCallback((id: string) => {
    setNewBadges((prev) => prev.filter((b) => b.id !== id));
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; stop(); };
  }, [stop]);

  const goToIndex = useCallback((nextIdx: number) => {
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setIdx(nextIdx);
    setPhase('listen');
    setListenCt(0);
    setSpeakCt(0);
    autoAdvanceRef.current = false;
    listenStartedRef.current = false;
  }, [stop]);

  const adv = useCallback(() => {
    if (!cur) return;
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setDone((p) => new Set(p).add(cur.id));
    markSentenceComplete(cur.id, cur.courseId, cur.lessonId, Math.min(idx + 1, total - 1));
    const progress = getProgress();
    const earned = checkAndPersistBadges(progress);
    if (earned.length > 0) setNewBadges((prev) => [...prev, ...earned]);
    if (idx < total - 1) goToIndex(idx + 1);
    else setFinished(true);
  }, [cur, idx, total, stop, goToIndex]);

  const goBack = useCallback(() => { if (idx > 0) goToIndex(idx - 1); }, [idx, goToIndex]);

  useEffect(() => {
    if (phase === 'listen' && cur && listenCt === 0 && !listenStartedRef.current) {
      listenStartedRef.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current) {
          listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi,
            () => { if (mountedRef.current) setPhase('speak'); });
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, idx, cur?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (phase === 'listen' && listenCt >= 3) setPhase('speak'); }, [listenCt, phase]);

  useEffect(() => {
    if (phase === 'speak' && speakCt >= 3 && !autoAdvanceRef.current) {
      autoAdvanceRef.current = true;
      const t = setTimeout(() => { if (mountedRef.current) adv(); }, 1500);
      return () => clearTimeout(t);
    }
  }, [speakCt, phase, adv]);

  const handleManualPlay = useCallback(() => {
    if (!cur) return;
    stop();
    setTimeout(() => {
      if (mountedRef.current && cur) {
        playOnce(cur.id, cur.courseId, cur.english, () => {
          if (mountedRef.current && listenCt >= 3) setPhase('speak');
        });
      }
    }, 80);
  }, [stop, playOnce, cur, listenCt]);

  const handleSkipListen = useCallback(() => { stop(); if (mountedRef.current) { setPhase('speak'); setListenCt(3); } }, [stop]);
  const handleSkipSpeak = useCallback(() => { stop(); if (mountedRef.current) setSpeakCt(3); }, [stop]);

  if (finished) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center page-canvas lesson-complete-pop">
        <Confetti />
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-5xl shadow-glow-success animate-float mb-6">
          🎉
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Trial Complete!</h1>
        <p className="text-gray-500 mt-2 text-sm">{total} sentences practiced! 👏</p>
        <div className="mt-8 w-full max-w-xs space-y-3">
          <a href="/course/beginner" className="btn-premium btn-premium-gradient w-full py-4 text-sm block text-center rounded-2xl">
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
  const isAudioActive = isPlaying || isLoading;
  const currentStep: 1 | 2 | 3 = phase === 'listen' ? 1 : speakCt >= 3 ? 3 : 2;

  return (
    <div className="min-h-dvh flex flex-col page-canvas overflow-x-hidden">
      {/* Badge toasts */}
      {newBadges.length > 0 && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 space-y-2">
          {newBadges.map((b) => <BadgeToast key={b.id} badge={b} onDismiss={() => dismissBadge(b.id)} />)}
        </div>
      )}

      {/* ══════════ TOP HEADER ══════════ */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { stop(); setFinished(true); }}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-800 hover:border-gray-300 active:scale-95 transition-all"
          >
            ✕
          </button>
          <div className="text-center flex-1 min-w-0 mx-3">
            <p className="text-[11px] font-extrabold text-brand-600 uppercase tracking-widest">🎧 Free Trial</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {idx + 1} <span className="text-gray-300 font-normal">of</span> {total}
            </p>
          </div>
          <div className="w-10 h-10" />
        </div>
        <div className="h-1.5 bg-gray-200/70 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>

      {/* ══════════ STEP INDICATOR ══════════ */}
      <div className="px-5 py-2">
        <StepIndicator step={currentStep} />
      </div>

      {/* ══════════ MAIN SENTENCE CARD ══════════ */}
      <div className="flex-1 px-5 flex flex-col min-h-0">
        <div key={idx} className="sentence-slide-in flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-3xl shadow-[0_2px_4px_rgb(15_23_42/_0.04),0_12px_32px_-8px_rgb(15_23_42/_0.1)] border border-gray-100 px-6 py-6 sm:py-8 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-400 font-extrabold mb-3">English Sentence</p>
              <p className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-snug text-gray-900 max-w-lg">
                &ldquo;{cur.english}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-gray-100 w-full max-w-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400 font-extrabold mb-2">🇮🇳 हिंदी में अर्थ</p>
                <p className="text-[17px] sm:text-lg text-gray-600 leading-relaxed">{cur.hindi}</p>
              </div>
            </div>

            {/* LISTEN */}
            {phase === 'listen' && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-extrabold">🎧 Listen</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      listenCt >= n ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : isPlaying && playCount === n - 1 ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow-brand'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>{listenCt >= n ? '✓' : n}</div>
                  ))}
                </div>
                <div className="flex justify-center mb-3"><Waveform active={isAudioActive} /></div>
                {isAudioActive ? (
                  <button onClick={handleSkipListen} className="w-full bg-white border-2 border-brand-200 text-brand-700 font-bold py-3.5 rounded-2xl text-sm active:scale-[.98] transition-all hover:bg-brand-50">
                    ⏹ Stop Audio
                  </button>
                ) : (
                  <button onClick={() => {
                    if (listenCt >= 3) { handleManualPlay(); return; }
                    listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi, () => { if (mountedRef.current) setPhase('speak'); });
                  }} className="w-full btn-premium btn-premium-gradient py-3.5 text-sm rounded-2xl">
                    {listenCt >= 3 ? '🔊 Listen Again' : '▶ Listen to Sentence'}
                  </button>
                )}
              </div>
            )}

            {/* SPEAK */}
            {phase === 'speak' && (
              <div className="mt-5 pt-4 border-t border-gray-100">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-gray-400 font-extrabold">🎤 Your Turn</p>
                  <p className="text-xs text-gray-500 mt-1">Say the complete sentence</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      speakCt >= n ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>{speakCt >= n ? '✓' : n}</div>
                  ))}
                </div>
                {isAudioActive ? (
                  <button onClick={handleSkipSpeak} className="w-full bg-white border-2 border-brand-200 text-brand-700 font-bold py-3.5 rounded-2xl text-sm active:scale-[.98] transition-all hover:bg-brand-50">
                    ⏹ Stop
                  </button>
                ) : speakCt >= 3 ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-3xl shadow-glow-success check-pop mb-3">✓</div>
                    <p className="text-sm font-bold text-success-700">Great job!</p>
                    <p className="text-xs text-gray-400 mt-1">Moving to next sentence...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button onClick={() => setSpeakCt((p) => Math.min(p + 1, 3))}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl shadow-glow-brand active:scale-95 transition-all mic-pulse"
                      aria-label="Tap to speak">
                      🎤
                    </button>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Tap to speak ({speakCt}/3)</p>
                  </div>
                )}
                {!isAudioActive && speakCt < 3 && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { if (!cur) return; stop(); setTimeout(() => { if (mountedRef.current && cur) playOnce(cur.id, cur.courseId, cur.english); }, 80); }}
                      className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-xs hover:bg-gray-50 active:scale-[.97] transition-all">
                      🔊 Listen Again
                    </button>
                    <button onClick={handleSkipSpeak}
                      className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-semibold py-3 rounded-xl text-xs hover:bg-gray-50 active:scale-[.97] transition-all">
                      ⏭ Skip
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════ BOTTOM NAV ══════════ */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        <div className="flex items-center justify-between">
          <button onClick={goBack} disabled={idx === 0}
            className="h-12 px-5 rounded-full bg-white border-2 border-gray-200 text-gray-600 font-bold text-sm flex items-center gap-1.5 hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none">
            ← Back
          </button>
          <span className="text-sm font-bold text-gray-400 tabular-nums">{idx + 1}/{total}</span>
          <button onClick={adv}
            className="h-12 px-5 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition-all">
            {idx === total - 1 ? '✓ Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
