import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../lib/auth';
import { useParams, useNavigate } from 'react-router-dom';
import { loadCourse } from '../data/content';
import type { CourseData } from '../data/content';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { getProgress, markLessonComplete, markSentenceComplete } from '../lib/progress';
import BadgeToast from '../components/BadgeToast';
import { checkAndPersistBadges } from '../lib/badges';
import type { Badge } from '../config/badges';
import { ArrowLeft, ArrowRight, Volume2, Mic, Check, SkipForward, Lock, Play, Square } from 'lucide-react';

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
    { n: 1 as const, label: 'Listen', done: step > 1, Icon: Volume2 },
    { n: 2 as const, label: 'Speak', done: step > 2, Icon: Mic },
    { n: 3 as const, label: 'Next', done: false, Icon: ArrowRight },
  ];
  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all duration-300 ${
              s.n === step && !s.done
                ? 'bg-brand-100 text-brand-700 step-active'
                : s.done
                ? 'bg-success-100 text-success-700'
                : 'bg-surface-100 text-surface-400'
            }`}
          >
            {s.done ? <Check size={12} strokeWidth={3} /> : <s.Icon size={12} strokeWidth={2.5} />}
            {s.label}
          </div>
          {i < steps.length - 1 && (
            <ArrowRight size={10} className={`${s.done ? 'text-success-400' : 'text-surface-300'}`} strokeWidth={2.5} />
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Main Lesson Component ── */
export default function Lesson() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'listen' | 'speak'>('listen');
  const [listenCt, setListenCt] = useState(0);
  const [speakCt, setSpeakCt] = useState(0);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [badgeQueue, setBadgeQueue] = useState<Badge[]>([]);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const dismissBadge = useCallback(() => {
    setBadgeQueue((prev) => prev.slice(1));
  }, []);
  const { status, playOnce, listenThreeTimes, playCount, stop } = useSentenceAudio();
  const autoAdvanceRef = useRef(false);
  const mountedRef = useRef(true);
  const listenStartedRef = useRef(false);

  const { user, subscription } = useAuth();
  const [course, setCourse] = useState<CourseData | null>(null);
  useEffect(() => {
    if (courseId) loadCourse(courseId).then(setCourse);
  }, [courseId]);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  const sentences = lesson?.sentences ?? [];
  const total = sentences.length;
  const cur = sentences[idx];

  const isFree = course?.isFree || courseId === 'free-trial';
  if (!isFree && !subscription.active && !user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
          <Lock size={28} className="text-brand-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Premium Course</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">Sign in and purchase a plan to access this course.</p>
        <button onClick={() => navigate('/login')} className="mt-6 btn-premium btn-premium-gradient px-8 py-3 rounded-2xl text-sm">
          Sign In & Unlock
        </button>
        <button onClick={() => navigate('/pricing')} className="mt-3 text-sm text-brand-600 font-semibold">
          See Pricing
        </button>
      </div>
    );
  }
  if (!isFree && subscription && !subscription.active && user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
          <Lock size={28} className="text-brand-400" strokeWidth={1.5} />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900">Access Required</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-xs">Purchase a plan to unlock all courses.</p>
        <button onClick={() => navigate('/pricing')} className="mt-6 btn-premium btn-premium-gradient px-8 py-3 rounded-2xl text-sm">
          Get Full Access
        </button>
      </div>
    );
  }

  useEffect(() => {
    mountedRef.current = true;
    setPhase('listen');
    setListenCt(0);
    setSpeakCt(0);
    setLessonFinished(false);
    setHasStarted(false);
    autoAdvanceRef.current = false;
    listenStartedRef.current = false;
    const saved = getProgress();
    const ids = new Set(sentences.map((s) => s.id));
    const already = new Set(Object.keys(saved.completedSentences).filter((id) => ids.has(id)));
    setDone(already);
    const last = saved.lastLesson;
    if (last && last.lessonId === lessonId && last.sentenceIndex < sentences.length) {
      setIdx(last.sentenceIndex);
    } else {
      setIdx(0);
    }
    return () => { mountedRef.current = false; stop(); };
  }, [lessonId]);

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
    if (!cur || !courseId || !lessonId) return;
    stop();
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    setDone((p) => new Set(p).add(cur.id));
    markSentenceComplete(cur.id, cur.courseId, lessonId, Math.min(idx + 1, total - 1));
    const progress = getProgress();
    const earned = checkAndPersistBadges(progress);
    if (earned.length > 0) setBadgeQueue((prev) => [...prev, ...earned.slice(0, 3)]);
    if (idx < total - 1) { goToIndex(idx + 1); }
    else { markLessonComplete(lessonId); setLessonFinished(true); }
  }, [cur, idx, total, courseId, lessonId, stop, goToIndex]);

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

  const handleSkipListen = useCallback(() => {
    stop();
    if (mountedRef.current) { setPhase('speak'); setListenCt(3); }
  }, [stop]);

  const handleSkipSpeak = useCallback(() => {
    stop();
    if (mountedRef.current) setSpeakCt(3);
  }, [stop]);

  if (!course || !lesson) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">Lesson not found</div>;
  }
  if (!cur) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">No sentences in this lesson</div>;
  }

  const pct = (done.size / Math.max(total, 1)) * 100;
  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isAudioActive = isPlaying || isLoading;
  const currentStep: 1 | 2 | 3 = phase === 'listen' ? 1 : speakCt >= 3 ? 3 : 2;

  /* ── Lesson Complete ── */
  if (lessonFinished) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center px-6 text-center page-canvas lesson-complete-pop">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center shadow-glow-success animate-float mb-6">
          <Check size={40} strokeWidth={3} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Lesson Complete!</h1>
        <p className="text-gray-500 mt-2 text-sm">{total} / {total} sentences completed</p>
        <div className="mt-8 w-full max-w-xs space-y-3">
          <button onClick={() => navigate(`/course/${courseId}`)} className="w-full btn-premium btn-premium-gradient py-4 text-sm font-bold rounded-2xl">
            Continue Learning <ArrowRight size={14} strokeWidth={2.5} />
          </button>
          <button onClick={() => navigate('/progress')} className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl text-sm hover:border-brand-300 transition-colors">
            View Progress
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh flex flex-col page-canvas overflow-x-hidden">
      {badgeQueue.length > 0 && (
        <div className="fixed top-4 right-4 z-50">
          <BadgeToast key={badgeQueue[0].id} badge={badgeQueue[0]} onDismiss={dismissBadge} />
        </div>
      )}

      {/* ── TOP HEADER ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => { stop(); navigate(-1); }} aria-label="Back"
            className="w-10 h-10 rounded-full bg-white border border-surface-200 shadow-sm flex items-center justify-center text-surface-500 hover:text-gray-800 hover:border-surface-300 active:scale-95 transition-all">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="text-center flex-1 min-w-0 mx-3">
            <p className="text-[11px] font-extrabold text-brand-600 uppercase tracking-widest">{lesson.title}</p>
            <p className="text-sm font-bold text-gray-900 mt-0.5">
              {idx + 1} <span className="text-gray-300 font-normal">of</span> {total}
            </p>
          </div>
          <div className="w-10 h-10" />
        </div>
        <div className="h-1.5 bg-surface-200/70 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(pct, 2)}%` }} />
        </div>
      </div>

      {/* ── STEP INDICATOR ── */}
      <div className="px-5 py-2">
        <StepIndicator step={currentStep} />
      </div>

      {/* ── MAIN SENTENCE CARD ── */}
      <div className="flex-1 px-5 flex flex-col min-h-0">
        <div key={`${courseId}-${idx}`} className="sentence-slide-in flex-1 flex flex-col">
          <div className="flex-1 bg-white rounded-3xl shadow-[0_2px_4px_rgb(15_23_42/_0.04),0_12px_32px_-8px_rgb(15_23_42/_0.1)] border border-surface-100 px-6 py-6 sm:py-8 flex flex-col">
            {/* English sentence */}
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] text-brand-400 font-extrabold mb-3">
                English Sentence
              </p>
              <p className="text-[22px] sm:text-[28px] lg:text-[32px] font-bold leading-snug text-gray-900 max-w-lg">
                &ldquo;{cur.english}&rdquo;
              </p>

              {/* Hindi meaning */}
              <div className="mt-5 pt-5 border-t border-surface-100 w-full max-w-md">
                <p className="text-[11px] uppercase tracking-[0.18em] text-surface-400 font-extrabold mb-2">
                  Hindi Meaning
                </p>
                <p className="text-[17px] sm:text-lg text-gray-600 leading-relaxed">{cur.hindi}</p>
              </div>
            </div>

            {/* ── LISTEN SECTION ── */}
            {phase === 'listen' && !hasStarted && (
              <div className="mt-5 pt-4 border-t border-surface-100">
                <button onClick={() => setHasStarted(true)}
                  className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-2xl inline-flex items-center justify-center gap-2">
                  <Play size={18} fill="white" strokeWidth={0} />
                  Tap to Start Listening
                </button>
              </div>
            )}
            {phase === 'listen' && hasStarted && (
              <div className="mt-5 pt-4 border-t border-surface-100">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-surface-400 font-extrabold inline-flex items-center gap-1">
                    <Volume2 size={12} strokeWidth={2.5} />
                    Listen
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      listenCt >= n
                        ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                        : isPlaying && playCount === n - 1
                        ? 'bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow-brand'
                        : 'bg-surface-100 text-surface-400 border border-surface-200'
                    }`}>
                      {listenCt >= n ? <Check size={14} strokeWidth={3} /> : n}
                    </div>
                  ))}
                </div>
                <div className="flex justify-center mb-3">
                  <Waveform active={isAudioActive} />
                </div>
                {isAudioActive ? (
                  <button onClick={handleSkipListen}
                    className="w-full bg-white border-2 border-brand-200 text-brand-700 font-bold py-3.5 rounded-2xl text-sm active:scale-[.98] transition-all hover:bg-brand-50 inline-flex items-center justify-center gap-2">
                    <Square size={14} strokeWidth={2.5} />
                    Stop Audio
                  </button>
                ) : (
                  <button onClick={() => {
                    if (listenCt >= 3) { handleManualPlay(); return; }
                    listenThreeTimes(cur.id, cur.courseId, cur.english, setListenCt, cur.hindi, () => {
                      if (mountedRef.current) setPhase('speak');
                    });
                  }} className="w-full btn-premium btn-premium-gradient py-3.5 text-sm rounded-2xl">
                    {listenCt >= 3 ? <><Volume2 size={16} strokeWidth={2.5} /> Listen Again</> : <><Play size={16} fill="white" strokeWidth={0} /> Listen to Sentence</>}
                  </button>
                )}
              </div>
            )}

            {/* ── SPEAK SECTION ── */}
            {phase === 'speak' && (
              <div className="mt-5 pt-4 border-t border-surface-100">
                <div className="text-center mb-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-surface-400 font-extrabold inline-flex items-center gap-1">
                    <Mic size={12} strokeWidth={2.5} />
                    Your Turn
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Say the complete sentence</p>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-extrabold transition-all duration-300 ${
                      speakCt >= n
                        ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                        : 'bg-surface-100 text-surface-400 border border-surface-200'
                    }`}>
                      {speakCt >= n ? <Check size={14} strokeWidth={3} /> : n}
                    </div>
                  ))}
                </div>

                {isAudioActive ? (
                  <button onClick={handleSkipSpeak}
                    className="w-full bg-white border-2 border-brand-200 text-brand-700 font-bold py-3.5 rounded-2xl text-sm active:scale-[.98] transition-all hover:bg-brand-50 inline-flex items-center justify-center gap-2">
                    <Square size={14} strokeWidth={2.5} />
                    Stop
                  </button>
                ) : speakCt >= 3 ? (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center shadow-glow-success check-pop mb-3">
                      <Check size={28} strokeWidth={3} />
                    </div>
                    <p className="text-sm font-bold text-success-700">Great job!</p>
                    <p className="text-xs text-gray-400 mt-1">Moving to next sentence...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <button onClick={() => setSpeakCt((p) => Math.min(p + 1, 3))}
                      className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center shadow-glow-brand active:scale-95 transition-all mic-pulse"
                      aria-label="Tap to speak">
                      <Mic size={28} strokeWidth={2} />
                    </button>
                    <p className="text-xs text-gray-500 mt-2 font-medium">Tap to speak ({speakCt}/3)</p>
                  </div>
                )}

                {!isAudioActive && speakCt < 3 && (
                  <div className="flex gap-2 mt-4">
                    <button onClick={() => {
                      if (!cur) return;
                      stop();
                      setTimeout(() => { if (mountedRef.current && cur) playOnce(cur.id, cur.courseId, cur.english); }, 80);
                    }} className="flex-1 bg-white border-2 border-surface-200 text-surface-600 font-semibold py-3 rounded-xl text-xs hover:bg-surface-50 active:scale-[.97] transition-all inline-flex items-center justify-center gap-1">
                      <Volume2 size={13} strokeWidth={2} /> Listen Again
                    </button>
                    <button onClick={handleSkipSpeak}
                      className="flex-1 bg-white border-2 border-surface-200 text-surface-600 font-semibold py-3 rounded-xl text-xs hover:bg-surface-50 active:scale-[.97] transition-all inline-flex items-center justify-center gap-1">
                      <SkipForward size={13} strokeWidth={2} /> Skip
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM NAVIGATION ── */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        <div className="flex items-center justify-between">
          <button onClick={goBack} disabled={idx === 0}
            className="h-12 px-5 rounded-full bg-white border-2 border-surface-200 text-surface-600 font-bold text-sm flex items-center gap-1.5 hover:bg-surface-50 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none">
            <ArrowLeft size={14} strokeWidth={2.5} /> Back
          </button>
          <span className="text-sm font-bold text-surface-400 tabular-nums">{idx + 1}/{total}</span>
          <button onClick={adv}
            className="h-12 px-5 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition-all">
            {idx === total - 1 ? <><Check size={14} strokeWidth={2.5} /> Complete</> : <>Next <ArrowRight size={14} strokeWidth={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
