import { useState, useCallback, useEffect, useRef } from 'react';
import { freeTrialLesson, courseMetadata } from '../data/content';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { markSentenceComplete, getProgress } from '../lib/progress';
import Confetti from '../components/Confetti';
import BadgeToast from '../components/BadgeToast';
import { checkAndPersistBadges } from '../lib/badges';
import type { Badge } from '../config/badges';
import { Check } from 'lucide-react';

type Phase = 'listen' | 'speak';

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
            s.n === step && !s.done ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
            : s.done ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            : 'bg-white/5 text-white/30 border border-white/10'
          }`}>
            {s.done ? <Check size={12} strokeWidth={3} /> : <span className="text-[10px]">{s.n}</span>}
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <span className={`text-[10px] ${s.done ? 'text-emerald-400' : 'text-white/20'}`}>→</span>
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
    <div className="min-h-[80vh] flex flex-col items-center px-6 text-center pt-10 pb-10">
      {/* Hero */}
      <div className="w-20 h-20 rounded-3xl overflow-hidden mb-5 shadow-xl ring-4 ring-brand-500/30 bg-gradient-to-br from-brand-500/30 to-accent-500/20">
        <img
          src="/images/hero.webp"
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
      </div>

      {/* Badge */}
      <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-300 bg-emerald-500/12 border border-emerald-500/20 px-3 py-1 rounded-full mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        100% FREE TRIAL
      </span>

      <h1 className="text-3xl font-extrabold text-white">Free Trial</h1>
      <p className="text-white/50 mt-2 text-sm max-w-xs leading-relaxed">
        Try 25 real-life English sentences + 2 tenses.
        No login. No payment required.
      </p>

      {/* What's included */}
      <div className="mt-6 w-full max-w-xs">
        <div className="dark-card-page p-4">
          <p className="text-[11px] font-extrabold text-white/40 uppercase tracking-wider mb-3">What's included</p>
          <div className="grid grid-cols-2 gap-2.5 text-left">
            {[
              { icon: '📝', text: '25 English sentences' },
              { icon: '📘', text: '2 Tenses preview' },
              { icon: '🎧', text: 'Listen 3× each' },
              { icon: '🎤', text: 'Speak 3× each' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2">
                <span className="text-sm">{item.icon}</span>
                <span className="text-[12px] text-white/60 font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Start CTA */}
      <button
        onClick={onStart}
        className="mt-6 btn-premium btn-premium-gradient px-10 py-4 rounded-2xl text-base shadow-xl"
      >
        🎧 Start Free Trial
      </button>
      <p className="text-[11px] text-white/35 mt-3">No login · No payment · Full practice experience</p>

      {/* Grammar Preview Card */}
      <div className="mt-8 w-full max-w-sm">
        <a href="/tenses" className="block dark-card-page p-4 text-left hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <span className="text-white text-base font-extrabold">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-extrabold text-white">English Grammar</h3>
                <span className="text-[9px] font-extrabold text-indigo-300 bg-indigo-500/20 border border-indigo-500/30 px-1.5 py-0.5 rounded-full">FREE PREVIEW</span>
              </div>
              <p className="text-[11px] text-white/40 mt-0.5">2 free tenses · 12 total tenses</p>
            </div>
            <span className="text-white/30 text-sm">→</span>
          </div>
        </a>
      </div>

      {/* Beginner English — PAID */}
      <div className="mt-8 w-full max-w-sm">
        <div className="mb-4">
          <h2 className="text-lg font-extrabold text-white">Ready to learn more?</h2>
          <p className="text-white/40 text-xs mt-1">Unlock the complete Beginner English course</p>
        </div>
        <a
          href="/pricing"
          className="dark-card-page flex items-center gap-4 p-5 text-left hover:border-brand-500/30 transition-all group"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/15 to-teal-500/8 flex items-center justify-center shrink-0 text-2xl group-hover:scale-105 transition-transform">
            🌱
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base">Beginner English</h3>
              <span className="text-[9px] font-extrabold text-brand-300 bg-brand-500/12 px-2 py-0.5 rounded-full">PRO</span>
            </div>
            <p className="text-[12px] text-white/40 mt-1">29 Lessons · 725+ Sentences · Full course</p>
          </div>
          <span className="text-xs font-bold text-brand-300 bg-brand-500/12 px-4 py-2 rounded-full group-hover:bg-brand-500/20 transition-colors shrink-0">
            Unlock Course →
          </span>
        </a>
      </div>

      {/* All other courses */}
      <div className="mt-6 w-full max-w-sm">
        <p className="text-[11px] font-extrabold text-white/30 uppercase tracking-wider mb-3 text-left">All courses require a plan</p>
        <div className="space-y-2">
          {courseMetadata.filter(c => c.id !== 'beginner').slice(0, 5).map((course) => (
            <a
              key={course.id}
              href="/pricing"
              className="dark-card-page flex items-center gap-3 p-3 text-left hover:border-brand-500/20 transition-all group"
            >
              <span className="text-lg shrink-0">{course.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-[12px] font-bold text-white/70 truncate">{course.title}</h3>
                <p className="text-[10px] text-white/30 mt-0.5">{course.totalSentences}+ sentences · {course.totalLessons} lessons</p>
              </div>
              <span className="text-[9px] font-extrabold text-white/20 bg-white/5 px-1.5 py-0.5 rounded-full shrink-0">PRO</span>
            </a>
          ))}
        </div>
      </div>

      {/* Final CTA */}
      <a
        href="/pricing"
        className="mt-8 w-full max-w-sm btn-premium btn-premium-gradient py-4 text-sm block text-center rounded-xl font-bold shadow-lg"
      >
        View Plans →
      </a>
      <p className="text-[11px] text-white/30 mt-2 text-center">One-time payment · No auto-renewal · Instant access</p>

      <div className="h-10" />
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
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const [hasStarted, setHasStarted] = useState(false);
  const { status, playOnce, listenThreeTimes, playCount, stop } = useSentenceAudio();
  const autoAdvanceRef = useRef(false);
  const mountedRef = useRef(true);
  const listenStartedRef = useRef(false);

  const sentences = freeTrialLesson.sentences;
  const total = sentences.length;
  const cur = sentences[idx];

  const dismissBadge = useCallback(() => {
    setBadgeQueue((prev) => prev.slice(1));
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
    setHasStarted(false);
    autoAdvanceRef.current = false;
    listenStartedRef.current = false;
  }, [stop]);

  const adv = useCallback(() => {
    if (!cur) return;
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setDone((p) => new Set(p).add(cur.id));
    markSentenceComplete(cur.id, cur.courseId, freeTrialLesson.id, Math.min(idx + 1, total - 1));
    const progress = getProgress();
    const earned = checkAndPersistBadges(progress);
    if (earned.length > 0) setBadgeQueue((prev) => [...prev, ...earned.slice(0, 3)]);
    if (idx < total - 1) goToIndex(idx + 1);
    else setFinished(true);
  }, [cur, idx, total, stop, goToIndex]);

  const goBack = useCallback(() => { if (idx > 0) goToIndex(idx - 1); }, [idx, goToIndex]);

  useEffect(() => {
    if (phase === 'listen' && cur && listenCt === 0 && !listenStartedRef.current && hasStarted) {
      listenStartedRef.current = true;
      const t = setTimeout(() => {
        if (mountedRef.current) {
          listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi,
            () => { if (mountedRef.current) setPhase('speak'); });
        }
      }, 300);
      return () => clearTimeout(t);
    }
  }, [phase, idx, cur?.id, hasStarted]);

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
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center lesson-complete-pop">
        <Confetti />
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-5xl shadow-glow-success animate-float mb-6">
          🎉
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Trial Complete!</h1>
        <p className="text-white/50 mt-2 text-sm">{total} sentences practiced! 👏</p>
        <p className="text-white/35 text-xs mt-1">Want to learn more? Unlock the full course.</p>
        <div className="mt-8 w-full max-w-xs space-y-3">
          <a href="/pricing" className="btn-premium btn-premium-gradient w-full py-4 text-sm block text-center rounded-xl">
            🚀 Unlock Beginner English <span className="text-[10px] font-extrabold text-white/60 ml-1">PRO</span>
          </a>
          <a href="/courses" className="block w-full bg-white/5 border border-white/10 text-white/70 font-bold py-4 rounded-xl text-center text-sm hover:bg-white/10 transition-colors">
            📚 View All Courses
          </a>
          <a href="/tenses" className="block w-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold py-4 rounded-xl text-center text-sm hover:bg-indigo-500/20 transition-colors">
            📘 Grammar Free Preview
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
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      {badgeQueue.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <BadgeToast key={badgeQueue[0].id} badge={badgeQueue[0]} onDismiss={dismissBadge} />
        </div>
      )}

      {/* TOP HEADER */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => { stop(); setFinished(true); }}
            aria-label="Close"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 active:scale-95 transition-all"
          >
            ✕
          </button>
          <div className="text-center flex-1 min-w-0 mx-3">
            <p className="text-[11px] font-extrabold text-brand-300 uppercase tracking-widest">🎧 Free Trial</p>
            <p className="text-sm font-bold text-white mt-0.5">
              {idx + 1} <span className="text-white/30 font-normal">of</span> {total}
            </p>
          </div>
          <div className="w-10 h-10" />
        </div>
        <div className="dark-progress h-1.5">
          <div className="dark-progress-fill" style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>

      {/* STEP INDICATOR */}
      <div className="px-5 py-2">
        <StepIndicator step={currentStep} />
      </div>

      {/* MAIN SENTENCE CARD */}
      <div className="flex-1 px-5 flex flex-col min-h-0">
        <div key={idx} className="sentence-slide-in flex-1 flex flex-col">
          <div className="flex-1 dark-card-page px-6 py-6 sm:py-8 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-extrabold mb-3">English Sentence</p>
              <p className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-snug text-white max-w-lg">
                &ldquo;{cur.english}&rdquo;
              </p>
              <div className="mt-5 pt-5 border-t border-white/8 w-full max-w-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-extrabold mb-2">🇮🇳 हिंदी में अर्थ</p>
                <p className="text-[17px] sm:text-lg text-white/60 leading-relaxed">{cur.hindi}</p>
              </div>
            </div>

            {phase === 'listen' && !hasStarted && (
              <div className="mt-5 pt-4 border-t border-white/8">
                <button onClick={() => setHasStarted(true)}
                  className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl">
                  🔊 Tap to Start Listening
                </button>
              </div>
            )}
            {phase === 'listen' && hasStarted && (
              <div className="mt-5 pt-4 border-t border-white/8">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 font-extrabold">🎧 Listen</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      listenCt >= n ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : isPlaying && playCount === n - 1 ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow-brand'
                      : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>{listenCt >= n ? <Check size={14} strokeWidth={3} /> : n}</div>
                  ))}
                </div>
                <div className="flex justify-center mb-3"><Waveform active={isAudioActive} /></div>
                {isAudioActive ? (
                  <button onClick={handleSkipListen} className="w-full bg-white/5 border border-white/15 text-white/70 font-bold py-3.5 rounded-xl text-sm active:scale-[.98] transition-all hover:bg-white/10">
                    ⏹ Stop Audio
                  </button>
                ) : (
                  <button onClick={() => {
                    if (listenCt >= 3) { handleManualPlay(); return; }
                    listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi, () => { if (mountedRef.current) setPhase('speak'); });
                  }} className="w-full btn-premium btn-premium-gradient py-3.5 text-sm rounded-xl">
                    {listenCt >= 3 ? '🔊 Listen Again' : '▶ Listen to Sentence'}
                  </button>
                )}
              </div>
            )}

            {phase === 'speak' && (
              <div className="mt-5 pt-4 border-t border-white/8">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-white/35 font-extrabold">🎤 Your Turn</p>
                  <p className="text-xs text-white/45 mt-1">Say the complete sentence</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      speakCt >= n ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : 'bg-white/5 text-white/30 border border-white/10'
                    }`}>{speakCt >= n ? <Check size={14} strokeWidth={3} /> : n}</div>
                  ))}
                </div>
                {isAudioActive ? (
                  <button onClick={handleSkipSpeak} className="w-full bg-white/5 border border-white/15 text-white/70 font-bold py-3.5 rounded-xl text-sm active:scale-[.98] transition-all hover:bg-white/10">
                    ⏹ Stop
                  </button>
                ) : speakCt >= 3 ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-3xl shadow-glow-success check-pop mb-3">✓</div>
                    <p className="text-sm font-bold text-emerald-300">Great job!</p>
                    <p className="text-xs text-white/40 mt-1">Moving to next sentence...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button onClick={() => setSpeakCt((p) => Math.min(p + 1, 3))}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl shadow-glow-brand active:scale-95 transition-all mic-pulse"
                      aria-label="Tap to speak">
                      🎤
                    </button>
                    <p className="text-xs text-white/45 mt-2 font-medium">Tap to speak ({speakCt}/3)</p>
                  </div>
                )}
                {!isAudioActive && speakCt < 3 && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => { if (!cur) return; stop(); setTimeout(() => { if (mountedRef.current && cur) playOnce(cur.id, cur.courseId, cur.english); }, 80); }}
                      className="flex-1 bg-white/5 border border-white/10 text-white/60 font-semibold py-3 rounded-xl text-xs hover:bg-white/10 active:scale-[.97] transition-all">
                      🔊 Listen Again
                    </button>
                    <button onClick={handleSkipSpeak}
                      className="flex-1 bg-white/5 border border-white/10 text-white/60 font-semibold py-3 rounded-xl text-xs hover:bg-white/10 active:scale-[.97] transition-all">
                      ⏭ Skip
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        <div className="flex items-center justify-between">
          <button onClick={goBack} disabled={idx === 0}
            className="h-12 px-5 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm flex items-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none">
            ← Back
          </button>
          <span className="text-sm font-bold text-white/30 tabular-nums">{idx + 1}/{total}</span>
          <button onClick={adv}
            className="h-12 px-5 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition-all">
            {idx === total - 1 ? '✓ Complete' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
