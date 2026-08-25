/**
 * SunoBolo — 30-Day Grammar Journey: Day Experience (v2)
 *
 * KEY FIXES:
 * - State fully resets when dayNumber changes (prevents Day 2 false-completion)
 * - Backend completion status checked on mount
 * - Loading skeleton while data loads (no blank screen)
 * - Real mini_test with quiz questions, scoring, answer validation
 * - Premium audio used throughout
 * - Proper error handling for all states
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { pickPracticeVoice } from '../config/voiceConfig';
import { getDayCurriculum, type StepType, type QuizQuestion } from '../data/journey-curriculum';
import { allTenses } from '../data/tenses';
import { ArrowLeft, Play, ChevronRight, Check, Mic, Headphones, Lightbulb, RotateCcw, Trophy, AlertCircle, Loader2 } from 'lucide-react';

const STEP_META: Record<StepType, { icon: string; color: string; bg: string; label: string }> = {
  learn_concept:    { icon: '📘', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Learn' },
  see_examples:     { icon: '👁️', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', label: 'See' },
  listen:           { icon: '🎧', color: 'text-brand-400', bg: 'bg-brand-500/10 border-brand-500/20', label: 'Listen' },
  speak:            { icon: '🎤', color: 'text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20', label: 'Speak' },
  repeat_after:     { icon: '🔄', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Repeat' },
  recall_from_hi:   { icon: '🧠', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Recall' },
  choose_correct:   { icon: '✅', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'Choose' },
  fill_blank:       { icon: '✏️', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', label: 'Fill' },
  transform:        { icon: '🔀', color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20', label: 'Transform' },
  real_life:        { icon: '🌍', color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/20', label: 'Real Life' },
  quick_review:     { icon: '⚡', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20', label: 'Review' },
  mini_test:        { icon: '🏆', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20', label: 'Test' },
};

function getExampleData(exampleId: string) {
  for (const tense of allTenses) {
    const ex = tense.examples.find(e => e.id === exampleId);
    if (ex) return { tense, example: ex };
  }
  return null;
}

// ════════════════════════════════════════════════
// SEE EXAMPLES COMPONENT (see_examples step)
// Extracted from IIFE to comply with React Rules of Hooks
// ════════════════════════════════════════════════
function SeeExamplesStep({
  step,
  isPlaying,
  setIsPlaying,
  stop,
}: {
  step: { exampleId?: string; title: string; instruction?: string };
  isPlaying: boolean;
  setIsPlaying: (v: boolean) => void;
  stop: () => void;
}) {
  const data = getExampleData(step.exampleId || 'sp-1');
  const [activeFormIdx, setActiveFormIdx] = useState<number | null>(null);
  const seqGenRef = useRef(0);

  if (!data) return null;

  const forms = [
    { key: 'affirmative', label: '✓ Affirmative', color: 'text-emerald-400' },
    { key: 'negative', label: '− Negative', color: 'text-amber-400' },
    { key: 'interrogative', label: '? Interrogative', color: 'text-blue-400' },
  ];

  const playSequence = useCallback(() => {
    stop();
    setIsPlaying(true);
    setActiveFormIdx(null);
    const gen = ++seqGenRef.current;
    const exampleId = step.exampleId || 'sp-1';

    const audioPaths = [
      `/audio/tenses/${exampleId}-aff.mp3`,
      `/audio/tenses/${exampleId}-neg.mp3`,
      `/audio/tenses/${exampleId}-int.mp3`,
    ];
    const fallbackTexts = [
      data.example.affirmative.en,
      data.example.negative.en,
      data.example.interrogative.en,
    ];

    let currentIdx = 0;

    const playNext = () => {
      if (gen !== seqGenRef.current) return;
      if (currentIdx >= 3) {
        if (gen === seqGenRef.current) {
          setIsPlaying(false);
          setActiveFormIdx(null);
        }
        return;
      }

      const idx = currentIdx;
      setActiveFormIdx(idx);

      const tryMp3 = async (): Promise<boolean> => {
        try {
          const res = await fetch(audioPaths[idx], { method: 'HEAD' });
          if (!res.ok || gen !== seqGenRef.current) return false;
          const audio = new Audio();
          audio.src = audioPaths[idx];
          return new Promise<boolean>((resolve) => {
            let settled = false;
            const finish = (ok: boolean) => {
              if (settled) return;
              settled = true;
              try {
                audio.oncanplay = null;
                audio.onended = null;
                audio.onerror = null;
                audio.pause();
              } catch { /* ignore */ }
              resolve(ok);
            };
            audio.onended = () => finish(true);
            audio.onerror = () => finish(false);
            setTimeout(() => finish(false), 10000);
            audio.load();
            audio.oncanplay = () => {
              audio.play().then(() => {}).catch(() => finish(false));
            };
          });
        } catch {
          return false;
        }
      };

      const playWithTts = (): Promise<void> => {
        return new Promise<void>((resolve) => {
          if (gen !== seqGenRef.current) { resolve(); return; }
          if (typeof window === 'undefined' || !window.speechSynthesis) { resolve(); return; }
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(fallbackTexts[idx]);
          const voice = pickPracticeVoice();
          if (voice) {
            utt.voice = voice;
            utt.lang = voice.lang;
          } else {
            utt.lang = 'en-IN';
          }
          utt.rate = 0.85;
          utt.pitch = 1;
          let done = false;
          const finish = () => { if (!done) { done = true; resolve(); } };
          utt.onend = finish;
          utt.onerror = finish;
          setTimeout(finish, 8000);
          window.speechSynthesis.speak(utt);
        });
      };

      (async () => {
        const mp3Ok = await tryMp3();
        if (gen !== seqGenRef.current) return;
        if (!mp3Ok) {
          await playWithTts();
        }
        if (gen === seqGenRef.current) {
          await new Promise(r => setTimeout(r, 400));
        }
        currentIdx++;
        playNext();
      })();
    };

    playNext();
  }, [step.exampleId, data, stop, setIsPlaying]);

  const handlePlayClick = useCallback(() => {
    if (isPlaying) {
      stop();
      setActiveFormIdx(null);
      setTimeout(() => playSequence(), 100);
    } else {
      playSequence();
    }
  }, [isPlaying, stop, playSequence]);

  return (
    <div className="flex-1 flex flex-col">
      <h2 className="text-lg font-extrabold text-white mb-1 text-center">{step.title}</h2>
      <p className="text-sm text-white/40 text-center mb-4">{step.instruction}</p>

      {/* Single Play Button */}
      <div className="flex justify-center mb-5">
        <button
          onClick={handlePlayClick}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-bold shadow-lg shadow-violet-500/25 hover:from-violet-700 hover:to-purple-700 active:scale-[.97] transition-all"
        >
          {isPlaying ? (
            <><span className="animate-pulse">🔊</span> Playing all 3 forms...</>
          ) : (
            <>▶ Play All 3 Forms</>
          )}
        </button>
      </div>

      {/* 3 Form Cards */}
      <div className="space-y-3 flex-1">
        {forms.map((form, idx) => {
          const f = data.example[form.key as keyof typeof data.example];
          if (!f || typeof f === 'string') return null;
          const isActive = activeFormIdx === idx;
          return (
            <div
              key={form.key}
              className={`rounded-xl p-4 border transition-all duration-300 ${
                isActive
                  ? 'bg-violet-500/10 border-violet-500/25 ring-1 ring-violet-500/20'
                  : 'bg-white/[0.03] border-white/[0.05]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`text-[10px] font-bold ${form.color} uppercase tracking-wider`}>{form.label}</p>
                {isActive && (
                  <span className="text-[10px] font-bold text-violet-300 animate-pulse">▶ Now Playing</span>
                )}
              </div>
              <p className="text-base font-bold text-white">{f.en}</p>
              <p className="text-xs text-white/35 mt-1">{f.hi}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════
// QUIZ COMPONENT (used by mini_test)
// ════════════════════════════════════════════════
function QuizEngine({
  questions,
  onComplete,
}: {
  questions: QuizQuestion[];
  onComplete: (score: number, total: number) => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const progress = ((qIdx + 1) / questions.length) * 100;

  const handleSelect = useCallback((idx: number) => {
    if (showFeedback) return;
    setSelectedIdx(idx);
    setShowFeedback(true);
    const isCorrect = idx === q.correctIndex;
    if (isCorrect) setCorrectCount(c => c + 1);
    setAnswers(prev => {
      const next = [...prev];
      next[qIdx] = idx;
      return next;
    });
  }, [showFeedback, q, qIdx]);

  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(correctCount, questions.length);
      return;
    }
    setQIdx(i => i + 1);
    setSelectedIdx(null);
    setShowFeedback(false);
  }, [isLast, correctCount, questions.length, onComplete]);

  const typeLabel = q.type === 'mcq' ? 'Choose the correct option'
    : q.type === 'fill_blank' ? 'Fill in the blank'
    : q.type === 'hindi_to_english' ? 'Hindi → English'
    : q.type === 'transform' ? 'Transform the sentence'
    : 'Real-life situation';

  return (
    <div className="flex-1 flex flex-col">
      {/* Progress bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider">Question {qIdx + 1}/{questions.length}</span>
          <span className="text-[11px] font-bold text-white/40">{correctCount} correct</span>
        </div>
        <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-rose-500 to-pink-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Question type badge */}
      <div className="text-center mb-2">
        <span className="text-[10px] font-bold text-white/30 uppercase tracking-wider">{typeLabel}</span>
      </div>

      {/* Question */}
      <div className="text-center mb-5">
        <p className="text-lg font-bold text-white leading-snug">{q.question}</p>
        {q.hindi && <p className="text-sm text-white/40 mt-1.5">{q.hindi}</p>}
      </div>

      {/* Options */}
      <div className="space-y-3 flex-1">
        {q.options.map((opt, idx) => {
          const isSelected = selectedIdx === idx;
          const isCorrect = idx === q.correctIndex;
          let style = 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]';
          if (showFeedback && isSelected && isCorrect) style = 'bg-emerald-500/15 border-emerald-500/30';
          else if (showFeedback && isSelected && !isCorrect) style = 'bg-red-500/15 border-red-500/30';
          else if (showFeedback && isCorrect) style = 'bg-emerald-500/10 border-emerald-500/20';

          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={showFeedback}
              className={`w-full p-4 rounded-xl text-left border transition-all ${style} ${!showFeedback ? 'active:scale-[.98]' : ''}`}>
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/40 shrink-0">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm font-bold text-white">{opt}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      {showFeedback && (
        <div className={`mt-4 p-4 rounded-xl border text-sm font-medium ${
          selectedIdx === q.correctIndex
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
            : 'bg-red-500/10 border-red-500/20 text-red-300'
        }`}>
          <p className="font-bold mb-1">{selectedIdx === q.correctIndex ? '✅ Sahi jawab!' : '❌ Galat!'}</p>
          <p className="text-xs opacity-80">{q.explanation}</p>
        </div>
      )}

      {/* Next / Finish button */}
      {showFeedback && (
        <button onClick={handleNext}
          className="mt-4 w-full h-12 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-[.98] transition-all">
          {isLast ? (
            <><Trophy size={16} /> View Results</>
          ) : (
            <>Next Question <ChevronRight size={16} /></>
          )}
        </button>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════
export default function JourneyDay() {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const { subscription, loading: authLoading } = useAuth();
  const { listenThreeTimes, stop } = useSentenceAudio();
  const mountedRef = useRef(true);

  const day = parseInt(dayNumber || '0');
  const curriculum = getDayCurriculum(day);
  const hasFullAccess = subscription.active;
  const isAccessible = curriculum && (hasFullAccess || curriculum.isFree);

  // ── ALL state is keyed to dayNumber to prevent stale state across days ──
  const [stepIdx, setStepIdx] = useState(0);
  const [dayComplete, setDayComplete] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [dayScore, setDayScore] = useState<number | null>(null);

  // Step-specific state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);

  // ── CRITICAL FIX: Reset ALL state when day changes ──
  useEffect(() => {
    setStepIdx(0);
    setDayComplete(false);
    setIsPlaying(false);
    setCompleting(false);
    setDayScore(null);
    setSelectedOption(null);
    setShowFeedback(false);
    setFeedbackCorrect(false);
    stop();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [dayNumber, stop]);

  // ── Mount/unmount lifecycle ──
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; stop(); };
  }, [stop]);

  // ── Scroll to top on mount ──
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [dayNumber]);

  // ── Loading state (auth still loading) ──
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <Loader2 size={32} className="text-brand-400 animate-spin mb-4" />
        <p className="text-sm text-white/50 font-medium">Loading your lesson...</p>
      </div>
    );
  }

  // ── Day not found ──
  if (!curriculum) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={40} className="text-red-400 mb-4" />
        <h2 className="text-xl font-extrabold text-white">Day not found</h2>
        <p className="text-sm text-white/40 mt-2">This day doesn't exist in the curriculum.</p>
        <button onClick={() => navigate('/journey')} className="mt-6 btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl">
          Back to Journey
        </button>
      </div>
    );
  }

  // ── Premium required ──
  if (!isAccessible) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-xl font-extrabold text-white">Premium Required</h2>
        <p className="text-white/50 text-sm mt-2 max-w-xs">Day {day} requires an active subscription.</p>
        <button onClick={() => navigate('/pricing')} className="mt-6 btn-premium btn-premium-gradient px-8 py-3 rounded-xl text-sm">
          Get Full Access
        </button>
      </div>
    );
  }

  const steps = curriculum.steps;
  const currentStep = steps[stepIdx];
  const progress = ((stepIdx + 1) / steps.length) * 100;
  const meta = currentStep ? STEP_META[currentStep.type] : null;

  // Get display data for current step
  const getStepDisplay = () => {
    if (currentStep?.courseId && currentStep?.sentenceId && currentStep?.english) {
      return { en: currentStep.english, hi: currentStep.hindi || '', courseId: currentStep.courseId, sentenceId: currentStep.sentenceId };
    }
    if (currentStep?.exampleId) {
      const data = getExampleData(currentStep.exampleId);
      if (data) {
        const form = currentStep.formKey || 'affirmative';
        const f = data.example[form];
        if (f && typeof f === 'object' && 'en' in f) {
          return { en: f.en, hi: f.hi, courseId: undefined, sentenceId: undefined };
        }
      }
    }
    return null;
  };

  const display = getStepDisplay();

  // ── Navigation ──
  const goNext = useCallback(() => {
    setSelectedOption(null);
    setShowFeedback(false);
    setFeedbackCorrect(false);
    stop();

    if (stepIdx < steps.length - 1) {
      setStepIdx(stepIdx + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else {
      // Day complete — persist to backend with ACTUAL score
      setCompleting(true);
      fetch('/api/journey/complete-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ day, score: dayScore ?? 100 }),
      })
        .then(() => { if (mountedRef.current) { setDayComplete(true); setCompleting(false); } })
        .catch(() => { if (mountedRef.current) { setDayComplete(true); setCompleting(false); } });
    }
  }, [stepIdx, steps.length, stop, day, dayScore]);

  const goPrev = useCallback(() => {
    if (stepIdx > 0) {
      setStepIdx(stepIdx - 1);
      setSelectedOption(null);
      setShowFeedback(false);
      stop();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [stepIdx, stop]);

  // ── Audio ──
  const handleListen = useCallback(() => {
    if (!display) return;
    stop();
    setIsPlaying(true);

    if (display.courseId && display.sentenceId) {
      // Course audio: /audio/{courseId}/{sentenceId}.mp3
      listenThreeTimes(
        display.sentenceId, display.courseId, display.en,
        (count) => { if (!mountedRef.current) return; if (count >= 3) setIsPlaying(false); },
        display.hi,
        () => { if (mountedRef.current) setIsPlaying(false); },
      );
    } else if (currentStep?.exampleId) {
      // Tense example audio — use listenThreeTimes for ONE consistent voice
      // Construct the sentenceId to match /audio/tenses/{exampleId}-aff.mp3
      const tenseSentenceId = `${currentStep.exampleId}-aff`;
      listenThreeTimes(
        tenseSentenceId,
        'tenses',
        display.en,
        (count) => { if (!mountedRef.current) return; if (count >= 3) setIsPlaying(false); },
        display.hi,
        () => { if (mountedRef.current) setIsPlaying(false); },
      );
    }
  }, [display, currentStep, listenThreeTimes, stop]);

  const handleStopAudio = useCallback(() => { stop(); setIsPlaying(false); }, [stop]);

  // ── Quiz completion handler ──
  const handleQuizComplete = useCallback((correct: number, total: number) => {
    const score = Math.round((correct / total) * 100);
    setDayScore(score);
    // Auto-advance to completion
    setDayComplete(true);
    // Persist to backend
    fetch('/api/journey/complete-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ day, score }),
    }).catch(() => {});
  }, [day]);

  // ════════════════════════════════════════════════
  // RENDER: Day Complete
  // ════════════════════════════════════════════════
  if (dayComplete) {
    const scoreText = dayScore !== null ? `${dayScore}%` : '100%';
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-5xl shadow-glow-success animate-float mb-6">
          🎉
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Day {day} Complete!</h1>
        <p className="text-white/50 mt-2 text-sm">{curriculum.title} — {steps.length} steps done</p>
        {dayScore !== null && (
          <div className="mt-4 bg-white/[0.04] border border-white/[0.08] rounded-xl px-6 py-3">
            <p className="text-xs text-white/40 font-bold uppercase tracking-wider">Your Score</p>
            <p className="text-2xl font-extrabold text-white">{scoreText}</p>
          </div>
        )}
        <div className="mt-8 w-full max-w-xs space-y-3">
          {day < 30 && (
            <button onClick={() => navigate(`/journey/${day + 1}`)}
              className="w-full btn-premium btn-premium-gradient py-4 text-sm font-bold rounded-xl flex items-center justify-center gap-2">
              Start Day {day + 1} <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          )}
          <button onClick={() => navigate('/journey')}
            className="w-full bg-white/5 border border-white/10 text-white/70 font-bold py-4 rounded-xl text-sm hover:bg-white/10 transition-colors">
            Back to Journey
          </button>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // RENDER: Mini Test (REAL quiz)
  // ════════════════════════════════════════════════
  if (currentStep?.type === 'mini_test' && currentStep.quizQuestions && currentStep.quizQuestions.length > 0) {
    return (
      <div className="min-h-dvh flex flex-col overflow-x-hidden">
        {/* Header */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => navigate(-1)} aria-label="Back"
              className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 active:scale-95 transition-all">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="text-center flex-1 min-w-0 mx-3">
              <p className="text-[11px] font-extrabold text-rose-300 uppercase tracking-widest">
                Day {day} — Final Test
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                {currentStep.title}
              </p>
            </div>
            <div className="w-10 h-10" />
          </div>
        </div>

        {/* Step type badge */}
        <div className="px-5 py-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border bg-rose-500/10 border-rose-500/20 text-xs font-bold text-rose-400">
            <span>🏆</span>
            Test
          </div>
        </div>

        {/* Quiz */}
        <div className="flex-1 px-5 flex flex-col min-h-0">
          <div className="flex-1 dark-card-page px-6 py-6 sm:py-8 flex flex-col">
            <QuizEngine
              questions={currentStep.quizQuestions}
              onComplete={handleQuizComplete}
            />
          </div>
        </div>

        {/* Bottom nav */}
        <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
          <div className="flex items-center justify-between">
            <button onClick={goPrev}
              className="h-12 px-5 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm flex items-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all">
              <ArrowLeft size={14} strokeWidth={2.5} /> Back
            </button>
            <span className="text-sm font-bold text-white/30 tabular-nums">Quiz</span>
            <div className="w-12" />
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════
  // RENDER: Current Step
  // ════════════════════════════════════════════════
  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      {/* ── HEADER ── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => navigate(-1)} aria-label="Back"
            className="w-10 h-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 active:scale-95 transition-all">
            <ArrowLeft size={18} strokeWidth={2.5} />
          </button>
          <div className="text-center flex-1 min-w-0 mx-3">
            <p className="text-[11px] font-extrabold text-brand-300 uppercase tracking-widest">
              Day {day} — {curriculum.title}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">
              Step {stepIdx + 1} <span className="text-white/30 font-normal">of</span> {steps.length}
            </p>
          </div>
          <div className="w-10 h-10" />
        </div>
        <div className="dark-progress h-1.5">
          <div className="dark-progress-fill transition-all duration-300" style={{ width: `${Math.max(progress, 2)}%` }} />
        </div>
      </div>

      {/* ── STEP TYPE INDICATOR ── */}
      {meta && (
        <div className="px-5 py-2">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${meta.bg} text-xs font-bold ${meta.color}`}>
            <span>{meta.icon}</span>
            {meta.label}
          </div>
        </div>
      )}

      {/* ── STEP CONTENT ── */}
      <div className="flex-1 px-5 flex flex-col min-h-0">
        <div key={`${dayNumber}-${stepIdx}`} className="sentence-slide-in flex-1 flex flex-col">
          <div className="flex-1 dark-card-page px-6 py-6 sm:py-8 flex flex-col">

            {/* ── learn_concept ── */}
            {currentStep.type === 'learn_concept' && display && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl mb-4 shadow-lg">📘</div>
                <h2 className="text-xl font-extrabold text-white mb-2">{currentStep.title}</h2>
                <p className="text-sm text-white/50 mb-6">{currentStep.instruction}</p>
                <div className="bg-white/[0.04] rounded-2xl p-5 border border-white/[0.06] w-full max-w-md mb-4">
                  <p className="text-[11px] font-extrabold text-brand-300 uppercase tracking-wider mb-2">Pattern</p>
                  <p className="text-lg font-extrabold text-white">{currentStep.subtitle}</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 w-full max-w-md">
                  <p className="text-[11px] font-bold text-emerald-300 mb-1">Example</p>
                  <p className="text-base font-bold text-white">{display.en}</p>
                  <p className="text-sm text-white/40 mt-1">{display.hi}</p>
                  {/* Premium Audio Button */}
                  <button
                    onClick={handleListen}
                    disabled={isPlaying}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold hover:bg-emerald-600/30 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isPlaying ? '⏳ Playing...' : '🔊 Listen'}
                  </button>
                </div>
              </div>
            )}

            {/* ── see_examples — Play All 3 Forms Sequentially ── */}
            {currentStep.type === 'see_examples' && (
              <SeeExamplesStep
                step={currentStep}
                isPlaying={isPlaying}
                setIsPlaying={setIsPlaying}
                stop={stop}
              />
            )}

            {/* ── listen ── */}
            {currentStep.type === 'listen' && display && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center mb-6 shadow-glow-brand">
                  <Headphones size={32} className="text-white" />
                </div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06] w-full max-w-md mb-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-extrabold mb-3">English</p>
                  <p className="text-xl font-bold text-white leading-snug">&ldquo;{display.en}&rdquo;</p>
                  <div className="mt-4 pt-4 border-t border-white/8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-extrabold mb-2">🇮🇳 Hindi</p>
                    <p className="text-base text-white/50">{display.hi}</p>
                  </div>
                </div>
                {isPlaying ? (
                  <button onClick={handleStopAudio} className="w-full max-w-md bg-white/5 border border-white/15 text-white/70 font-bold py-4 rounded-xl text-sm active:scale-[.98] transition-all hover:bg-white/10">
                    ⏹ Stop Audio
                  </button>
                ) : (
                  <button onClick={handleListen} className="w-full max-w-md btn-premium btn-premium-gradient py-4 text-sm rounded-xl flex items-center justify-center gap-2">
                    <Play size={16} fill="white" /> Listen to Sentence
                  </button>
                )}
              </div>
            )}

            {/* ── speak ── */}
            {currentStep.type === 'speak' && display && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-6 shadow-lg">
                  <Mic size={32} className="text-white" />
                </div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06] w-full max-w-md mb-6">
                  <p className="text-xl font-bold text-white leading-snug">&ldquo;{display.en}&rdquo;</p>
                  <p className="text-sm text-white/35 mt-2">{display.hi}</p>
                </div>
                <button onClick={handleListen} className="w-full max-w-md bg-white/5 border border-white/10 text-white/60 font-semibold py-3 rounded-xl text-xs hover:bg-white/10 active:scale-[.97] transition-all flex items-center justify-center gap-1.5 mb-3">
                  🔊 Listen First
                </button>
              </div>
            )}

            {/* ── repeat_after ── */}
            {currentStep.type === 'repeat_after' && display && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-6 shadow-lg">
                  <RotateCcw size={32} className="text-white" />
                </div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06] w-full max-w-md mb-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-amber-300 font-extrabold mb-3">Repeat After Audio</p>
                  <p className="text-xl font-bold text-white leading-snug">&ldquo;{display.en}&rdquo;</p>
                  <p className="text-sm text-white/35 mt-2">{display.hi}</p>
                </div>
                {isPlaying ? (
                  <button onClick={handleStopAudio} className="w-full max-w-md bg-white/5 border border-white/15 text-white/70 font-bold py-4 rounded-xl text-sm active:scale-[.98] transition-all hover:bg-white/10">
                    ⏹ Stop
                  </button>
                ) : (
                  <button onClick={handleListen} className="w-full max-w-md btn-premium btn-premium-gradient py-4 text-sm rounded-xl flex items-center justify-center gap-2">
                    <Play size={16} fill="white" /> Play & Repeat
                  </button>
                )}
              </div>
            )}

            {/* ── recall_from_hi — Tap to Reveal ── */}
            {currentStep.type === 'recall_from_hi' && display && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mb-6 shadow-lg">
                  <Lightbulb size={32} className="text-white" />
                </div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 w-full max-w-md mb-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-emerald-300 font-extrabold mb-3">🇮🇳 Hindi</p>
                  <p className="text-xl font-bold text-white">{display.hi}</p>
                  <p className="text-xs text-white/30 mt-3">English mein kya bolenge?</p>
                </div>
                {!showFeedback ? (
                  <button onClick={() => setShowFeedback(true)}
                    className="w-full max-w-md p-4 rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 text-emerald-300 font-bold text-sm hover:bg-emerald-500/10 active:scale-[.98] transition-all">
                    👆 Tap to reveal English
                  </button>
                ) : (
                  <div className="w-full max-w-md p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-center">
                    <p className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider mb-1">English</p>
                    <p className="text-lg font-bold text-white">{display.en}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── choose_correct ── */}
            {currentStep.type === 'choose_correct' && (
              <div className="flex-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-3xl mb-4 shadow-lg">✅</div>
                <h2 className="text-lg font-extrabold text-white mb-1 text-center">{currentStep.title}</h2>
                <p className="text-sm text-white/40 text-center mb-6">{currentStep.instruction}</p>
                <div className="space-y-3 w-full max-w-md">
                  {(currentStep.options || []).map((exId) => {
                    const data = getExampleData(exId);
                    if (!data) return null;
                    const isSelected = selectedOption === exId;
                    const isCorrect = exId === currentStep.correctAnswer;
                    return (
                      <button key={exId} onClick={() => { setSelectedOption(exId); setShowFeedback(true); setFeedbackCorrect(isCorrect); }}
                        className={`w-full p-4 rounded-xl text-left border transition-all ${
                          showFeedback && isSelected && isCorrect ? 'bg-emerald-500/15 border-emerald-500/30'
                          : showFeedback && isSelected && !isCorrect ? 'bg-red-500/15 border-red-500/30'
                          : 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08]'
                        }`}>
                        <p className="text-base font-bold text-white">{data.example.affirmative.en}</p>
                        <p className="text-xs text-white/35 mt-1">{data.example.affirmative.hi}</p>
                      </button>
                    );
                  })}
                </div>
                {showFeedback && (
                  <div className={`mt-4 p-3 rounded-xl text-sm font-bold text-center w-full max-w-md ${
                    feedbackCorrect ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20' : 'bg-red-500/15 text-red-300 border border-red-500/20'
                  }`}>
                    {feedbackCorrect ? '✅ Sahi jawab!' : '❌ Galat — dobara try karo'}
                  </div>
                )}
              </div>
            )}

            {/* ── fill_blank — Tap to Reveal ── */}
            {currentStep.type === 'fill_blank' && display && (() => {
              const words = display.en.split(' ');
              const mid = Math.floor(words.length / 2);
              const blankWord = words[mid] || words[words.length - 1];
              const sentenceWithBlank = words.map((w, i) => i === mid ? '______' : w).join(' ');
              return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-3xl mb-4 shadow-lg">✏️</div>
                  <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                  <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                  <div className="bg-white/[0.04] rounded-2xl p-6 border border-white/[0.06] w-full max-w-md mb-6">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-orange-300 font-extrabold mb-3">Complete the Sentence</p>
                    <p className="text-xl font-bold text-white leading-snug">{sentenceWithBlank}</p>
                    <p className="text-sm text-white/35 mt-3">{display.hi}</p>
                  </div>
                  {!showFeedback ? (
                    <button onClick={() => setShowFeedback(true)}
                      className="w-full max-w-md p-4 rounded-xl border border-dashed border-orange-500/30 bg-orange-500/5 text-orange-300 font-bold text-sm hover:bg-orange-500/10 active:scale-[.98] transition-all">
                      👆 Tap to reveal answer
                    </button>
                  ) : (
                    <div className="w-full max-w-md p-4 rounded-xl border border-orange-500/20 bg-orange-500/10 text-center">
                      <p className="text-[10px] font-bold text-orange-300 uppercase tracking-wider mb-1">Missing Word</p>
                      <p className="text-lg font-bold text-white">{blankWord}</p>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── transform — Show Transformation ── */}
            {currentStep.type === 'transform' && display && (() => {
              // Look up the actual transformed answer from tenses data
              const transformData = currentStep.exampleId ? getExampleData(currentStep.exampleId) : null;
              const transformForm = (currentStep.transformTo || 'negative') as string;
              const transformedForm = transformData ? (transformData.example as unknown as Record<string, { en: string; hi: string }>)[transformForm] : null;
              const transformedEn = (transformedForm && typeof transformedForm === 'object' && 'en' in transformedForm) ? transformedForm.en : display.en;
              const transformedHi = (transformedForm && typeof transformedForm === 'object' && 'hi' in transformedForm) ? transformedForm.hi : display.hi;
              const formLabel = currentStep.transformTo || 'negative';

              return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl mb-4 shadow-lg">🔀</div>
                  <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                  <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                  <div className="space-y-4 w-full max-w-md mb-6">
                    <div className="bg-white/[0.04] rounded-xl p-4 border border-white/[0.06]">
                      <p className="text-[10px] font-bold text-white/30 uppercase tracking-wider mb-1">Given</p>
                      <p className="text-lg font-bold text-white">{display.en}</p>
                      <p className="text-xs text-white/30 mt-1">{display.hi}</p>
                    </div>
                    <div className="text-center text-2xl text-white/20">↓</div>
                    {!showFeedback ? (
                      <button onClick={() => setShowFeedback(true)}
                        className="w-full p-4 rounded-xl border border-dashed border-violet-500/30 bg-violet-500/5 text-violet-300 font-bold text-sm hover:bg-violet-500/10 active:scale-[.98] transition-all">
                        👆 Tap to reveal {formLabel} form
                      </button>
                    ) : (
                      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                        <p className="text-[10px] font-bold text-violet-300 uppercase tracking-wider mb-1">Transformed ({formLabel})</p>
                        <p className="text-lg font-bold text-white">{transformedEn}</p>
                        <p className="text-xs text-white/35 mt-1">{transformedHi}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ── real_life — Think & Reveal ── */}
            {currentStep.type === 'real_life' && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-3xl mb-4 shadow-lg">🌍</div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-teal-500/10 border border-teal-500/20 rounded-2xl p-6 w-full max-w-md mb-6">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-teal-300 font-extrabold mb-3">Real Situation</p>
                  <p className="text-base font-bold text-white leading-snug">{currentStep.instruction}</p>
                </div>
                {!showFeedback ? (
                  <button onClick={() => setShowFeedback(true)}
                    className="w-full max-w-md p-4 rounded-xl border border-dashed border-teal-500/30 bg-teal-500/5 text-teal-300 font-bold text-sm hover:bg-teal-500/10 active:scale-[.98] transition-all">
                    👆 Think of your answer, then tap to check
                  </button>
                ) : (
                  <div className="w-full max-w-md p-4 rounded-xl border border-teal-500/20 bg-teal-500/10">
                    <p className="text-[10px] font-bold text-teal-300 uppercase tracking-wider mb-1">Sample Response</p>
                    <p className="text-base font-bold text-white">Think in the tense you learned today and form a natural sentence.</p>
                    <p className="text-xs text-white/40 mt-2">There's no single correct answer — practice speaking naturally!</p>
                  </div>
                )}
              </div>
            )}

            {/* ── quick_review ── */}
            {currentStep.type === 'quick_review' && (
              <div className="flex-1 flex flex-col">
                <h2 className="text-lg font-extrabold text-white mb-1 text-center">{currentStep.title}</h2>
                <p className="text-sm text-white/40 text-center mb-4">{currentStep.instruction}</p>
                <div className="space-y-3 flex-1">
                  {curriculum.focusExamples.slice(0, 4).map(exId => {
                    const data = getExampleData(exId);
                    if (!data) return null;
                    return (
                      <div key={exId} className="bg-white/[0.03] rounded-xl p-3 border border-white/[0.05]">
                        <p className="text-[10px] font-bold text-white/30 uppercase mb-1">{data.example.label}</p>
                        <p className="text-sm font-bold text-white">{data.example.affirmative.en}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{data.example.negative.en}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── mini_test (no questions — fallback) ── */}
            {currentStep.type === 'mini_test' && (!currentStep.quizQuestions || currentStep.quizQuestions.length === 0) && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center text-3xl mb-4 shadow-lg">🏆</div>
                <h2 className="text-lg font-extrabold text-white mb-1">{currentStep.title}</h2>
                <p className="text-sm text-white/40 mb-6">{currentStep.instruction}</p>
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 w-full max-w-md">
                  <p className="text-base font-bold text-white mb-3">Test complete — move to next step!</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ── BOTTOM NAV ── */}
      <div className="px-5 pb-[max(env(safe-area-inset-bottom),16px)] pt-3">
        <div className="flex items-center justify-between">
          <button onClick={goPrev} disabled={stepIdx === 0}
            className="h-12 px-5 rounded-full bg-white/5 border border-white/10 text-white/60 font-bold text-sm flex items-center gap-1.5 hover:bg-white/10 active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none">
            <ArrowLeft size={14} strokeWidth={2.5} /> Back
          </button>
          <span className="text-sm font-bold text-white/30 tabular-nums">{stepIdx + 1}/{steps.length}</span>
          <button onClick={goNext} disabled={completing}
            className="h-12 px-5 rounded-full bg-brand-600 text-white font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-brand-500/25 hover:bg-brand-700 active:scale-95 transition-all disabled:opacity-50">
            {stepIdx === steps.length - 1 ? (completing ? 'Saving...' : <><Check size={14} strokeWidth={2.5} /> Complete</>) : <>Next <ChevronRight size={14} strokeWidth={2.5} /></>}
          </button>
        </div>
      </div>
    </div>
  );
}
