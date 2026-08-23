/**
 * SunoBolo — 30-Day Grammar Journey: Day Experience (v2)
 *
 * CRITICAL FIX: Each sentence button now passes its own exampleId
 * to the audio handler, preventing the bug where all buttons played
 * the first sentence's audio.
 *
 * Structure per example:
 * - Learn phase: Grammar explanation + all examples shown
 * - Practice phase: Guided Listen & Repeat for each example
 * - Test phase: Mini quiz
 * - Completion: Success state
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { getJourneyDay, type JourneyDay } from '../data/journey';
import { allTenses } from '../data/tenses';
import type { TenseExample } from '../data/tenses';
import { ArrowLeft, Play, Square, ChevronRight, BookOpen, Mic, Lock, Check, Volume2 } from 'lucide-react';

type Phase = 'learn' | 'practice' | 'test' | 'complete';

interface Question {
  id: string;
  sentence: string;
  correctAnswer: string;
  options: string[];
  tenseId: string;
}

// ── Form type config ──
const FORM_TYPES = [
  { key: 'affirmative' as const, suffix: 'aff', label: 'Affirmative', icon: '✓', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  { key: 'negative' as const, suffix: 'neg', label: 'Negative', icon: '−', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  { key: 'interrogative' as const, suffix: 'int', label: 'Interrogative', icon: '?', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
] as const;

// ── Reusable Sentence Row ──
function SentenceRow({
  form,
  en,
  hi,
  onListen,
  isPlaying,
  isCompleted,
}: {
  form: typeof FORM_TYPES[number];
  en: string;
  hi: string;
  onListen: () => void;
  isPlaying: boolean;
  isCompleted: boolean;
}) {
  return (
    <div className={`rounded-xl border p-3.5 ${form.bg} ${isCompleted ? 'ring-2 ring-emerald-500/30' : ''} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`text-xs font-bold ${form.color}`}>{form.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{form.label}</span>
          </div>
          <p className="text-[15px] font-extrabold text-white leading-snug">{en}</p>
          <p className="text-xs text-white/40 mt-1 leading-relaxed">{hi}</p>
        </div>
        <button
          onClick={onListen}
          disabled={isPlaying}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-brand-500/20 text-brand-400 ring-2 ring-brand-500/30'
              : 'bg-white/10 text-white/50 hover:bg-brand-500/20 hover:text-brand-300 border border-white/10'
          }`}
        >
          {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}

// ── Reusable Example Card ──
function ExampleCard({
  example,
  index,
  onListenForm,
  playingFormId,
  completedForms,
}: {
  example: TenseExample;
  index: number;
  onListenForm: (exampleId: string, en: string, hi: string, formSuffix: string) => void;
  playingFormId: string | null;
  completedForms: Set<string>;
}) {
  return (
    <div className="dark-card-page p-4 space-y-2">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px] font-extrabold text-white/30">EXAMPLE {index + 1}</span>
        <span className="text-xs text-white/15">—</span>
        <span className="text-xs font-semibold text-white/50">{example.label}</span>
      </div>
      {FORM_TYPES.map((form) => {
        const formId = `${example.id}-${form.suffix}`;
        const sentenceData = example[form.key];
        return (
          <SentenceRow
            key={form.key}
            form={form}
            en={sentenceData.en}
            hi={sentenceData.hi}
            isPlaying={playingFormId === formId}
            isCompleted={completedForms.has(formId)}
            onListen={() => onListenForm(example.id, sentenceData.en, sentenceData.hi, form.suffix)}
          />
        );
      })}
    </div>
  );
}

export default function JourneyDay() {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { status: audioStatus, listenThreeTimes, stop } = useSentenceAudio();

  const day = getJourneyDay(parseInt(dayNumber || '0'));
  const hasFullAccess = subscription.active;
  const isAccessible = day && (hasFullAccess || day.isFree);

  const [phase, setPhase] = useState<Phase>('learn');
  const [currentExampleIdx, setCurrentExampleIdx] = useState(0);
  const [completedExamples, setCompletedExamples] = useState<Set<string>>(new Set());
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [testScore, setTestScore] = useState(0);
  const [testPassed, setTestPassed] = useState(false);
  const [dayStarted, setDayStarted] = useState(false);
  const [completedForms, setCompletedForms] = useState<Set<string>>(new Set());
  const [playingFormId, setPlayingFormId] = useState<string | null>(null);

  // Guided flow state
  const [guidedActive, setGuidedActive] = useState(false);
  const [guidedSentenceIdx, setGuidedSentenceIdx] = useState(0);
  const [guidedRepeatCount, setGuidedRepeatCount] = useState(0);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, [stop]);

  const tense = day?.tenseId ? allTenses.find(t => t.id === day.tenseId) : null;
  const examples = tense?.examples || [];

  // Start day on server
  useEffect(() => {
    if (!user || !day || dayStarted) return;
    fetch('/api/journey/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ day: day.day }),
    }).catch(() => {});
    setDayStarted(true);
  }, [user, day, dayStarted]);

  // Generate test questions
  useEffect(() => {
    if (phase !== 'test' || testQuestions.length > 0 || !tense) return;
    const questions: Question[] = [];
    const forms = ['affirmative', 'negative', 'interrogative'] as const;
    for (const example of tense.examples) {
      const form = forms[Math.floor(Math.random() * forms.length)];
      const correctSentence = example[form].en;
      const otherForms = forms.filter(f => f !== form);
      const wrongOptions = otherForms.map(f => example[f].en);
      const options = [correctSentence, ...wrongOptions].sort(() => Math.random() - 0.5);
      questions.push({ id: `${example.id}-${form}`, sentence: `Form the ${form} form:`, correctAnswer: correctSentence, options, tenseId: tense.id });
    }
    setTestQuestions(questions.slice(0, Math.min(5, questions.length)));
  }, [phase, tense, testQuestions.length]);

  const handleDayComplete = useCallback(async (score: number) => {
    if (!user || !day) return;
    try {
      await fetch('/api/journey/complete-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ day: day.day, score }),
      });
    } catch {}
  }, [user, day]);

  /**
   * CRITICAL FIX: Play a specific sentence by its exampleId + formSuffix.
   * The exampleId is passed explicitly — NOT derived from currentExampleIdx.
   * This prevents the bug where all buttons played the first sentence.
   */
  const handleListenForm = useCallback((exampleId: string, en: string, hi: string, formSuffix: string) => {
    if (audioStatus === 'playing' || audioStatus === 'loading') {
      stop();
      setPlayingFormId(null);
      return;
    }
    const formId = `${exampleId}-${formSuffix}`;
    setPlayingFormId(formId);
    listenThreeTimes(
      `${exampleId}-${formSuffix}`,
      'tenses',
      en,
      (count) => {
        if (count >= 1) {
          setCompletedForms(prev => new Set(prev).add(formId));
        }
      },
      hi,
      () => {
        if (mountedRef.current) setPlayingFormId(null);
      },
    );
  }, [audioStatus, stop, listenThreeTimes]);

  // ── Guided Listen & Repeat ──
  const startGuided = useCallback(() => {
    setGuidedActive(true);
    setGuidedSentenceIdx(0);
    setGuidedRepeatCount(0);
    setPlayingFormId(null);
  }, []);

  const stopGuided = useCallback(() => {
    setGuidedActive(false);
    stop();
    setPlayingFormId(null);
  }, [stop]);

  // Drive the guided flow: play 3 repetitions of each form, then advance
  useEffect(() => {
    if (!guidedActive || !examples[currentExampleIdx]) return;
    const example = examples[currentExampleIdx];
    const form = FORM_TYPES[guidedSentenceIdx];
    if (!form) {
      // All forms done for this example
      setGuidedActive(false);
      setCompletedExamples(prev => new Set(prev).add(example.id));
      return;
    }
    if (guidedRepeatCount >= 3) {
      // Move to next form
      if (guidedSentenceIdx < FORM_TYPES.length - 1) {
        setGuidedSentenceIdx(i => i + 1);
        setGuidedRepeatCount(0);
      } else {
        // All forms done
        setGuidedActive(false);
        setCompletedExamples(prev => new Set(prev).add(example.id));
      }
      return;
    }
    // Play current form
    const sentenceData = example[form.key];
    const formId = `${example.id}-${form.suffix}`;
    setPlayingFormId(formId);
    listenThreeTimes(
      `${example.id}-${form.suffix}`,
      'tenses',
      sentenceData.en,
      () => {},
      sentenceData.hi,
      () => {
        if (mountedRef.current) {
          setPlayingFormId(null);
          setGuidedRepeatCount(c => c + 1);
        }
      },
    );
  }, [guidedActive, guidedSentenceIdx, guidedRepeatCount, currentExampleIdx, examples, listenThreeTimes]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(answer);
    const isCorrect = answer === testQuestions[currentQuestionIdx]?.correctAnswer;
    if (isCorrect) setTestScore(s => s + 1);
    setTimeout(() => {
      if (currentQuestionIdx < testQuestions.length - 1) {
        setCurrentQuestionIdx(i => i + 1);
        setSelectedAnswer(null);
      } else {
        const finalScore = Math.round(((testScore + (isCorrect ? 1 : 0)) / testQuestions.length) * 100);
        const passed = finalScore >= 60;
        setTestPassed(passed);
        setTestScore(finalScore);
        if (passed) handleDayComplete(finalScore);
        setPhase('complete');
      }
    }, 1500);
  };

  // ── Access check ──
  if (!day) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-extrabold text-white">Day not found</h2>
        <button onClick={() => navigate('/journey')} className="mt-4 text-brand-300 font-semibold text-sm">Back to Journey</button>
      </div>
    );
  }
  if (!isAccessible) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <Lock size={40} className="text-indigo-400 mb-4" />
        <h2 className="text-xl font-extrabold text-white">Full Access Required</h2>
        <p className="text-white/40 text-sm mt-2">Subscribe to unlock Day {day.day} and beyond.</p>
        <button onClick={() => navigate('/pricing')} className="mt-4 btn-premium btn-premium-gradient px-6 py-3 rounded-xl text-sm font-bold">Get Full Access →</button>
      </div>
    );
  }

  // ══════════════════════════════════════
  // LEARN PHASE
  // ══════════════════════════════════════
  if (phase === 'learn') {
    return (
      <div className="flex flex-col min-h-dvh animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 dark-glass-nav px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => navigate('/journey')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-brand-300">Day {day.day} / 30</p>
              <p className="text-[10px] text-white/30">{day.title}</p>
            </div>
            <div className="w-8" />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6 pb-24">
          {/* Day Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-1.5 mb-4">
              <span className="text-[11px] font-bold text-brand-300">Day {day.day}</span>
              <span className="text-white/15">·</span>
              <span className="text-[11px] text-white/40">{day.title}</span>
            </div>
            <h1 className="text-xl font-extrabold text-white">{day.title}</h1>
            <p className="text-sm text-white/50 mt-1">{day.subtitle}</p>
            <p className="text-xs text-white/35 mt-2 max-w-md mx-auto">{day.description}</p>
          </div>

          {/* Grammar Pattern */}
          {tense && (
            <div className="dark-card-page p-5 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen size={16} className="text-brand-400" />
                <h2 className="text-sm font-extrabold text-white">Pattern</h2>
              </div>
              <code className="block bg-white/5 px-3 py-2 rounded-lg font-mono text-sm text-brand-300 border border-white/8">
                {tense.pattern}
              </code>
              <div className="space-y-2 text-xs text-white/60">
                <p><span className="font-bold text-white/80">When to use:</span> {tense.explanation.when}</p>
                <p className="text-white/45">{tense.explanation.hindi}</p>
              </div>
            </div>
          )}

          {/* Examples */}
          {examples.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold text-white">Examples</h3>
              {examples.map((ex, idx) => (
                <ExampleCard
                  key={ex.id}
                  example={ex}
                  index={idx}
                  playingFormId={playingFormId}
                  completedForms={completedForms}
                  onListenForm={handleListenForm}
                />
              ))}
            </div>
          )}

          {/* Continue to Practice */}
          <button
            onClick={() => setPhase('practice')}
            className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <Mic size={16} />
            Continue to Practice
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // PRACTICE PHASE — Guided Listen & Repeat
  // ══════════════════════════════════════
  if (phase === 'practice') {
    const currentExample = examples[currentExampleIdx];
    const doneCount = completedExamples.size;
    const totalExamples = examples.length;
    const currentForm = FORM_TYPES[guidedSentenceIdx];

    return (
      <div className="flex flex-col min-h-dvh animate-fade-in">
        {/* Header */}
        <div className="sticky top-0 z-10 dark-glass-nav px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => { stopGuided(); setPhase('learn'); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-brand-300">Practice</p>
              <p className="text-[10px] text-white/30">Example {currentExampleIdx + 1} of {totalExamples}</p>
            </div>
            <div className="w-8" />
          </div>
          <div className="mt-2 h-1.5 bg-white/8 rounded-full overflow-hidden max-w-lg mx-auto">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${totalExamples > 0 ? (doneCount / totalExamples) * 100 : 0}%` }} />
          </div>
        </div>

        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-5 pb-24">
          {currentExample ? (
            <>
              {/* Current Sentence Display */}
              <div className="dark-card-page px-6 py-6 text-center">
                <p className="text-[11px] uppercase tracking-[0.18em] text-brand-300 font-extrabold mb-3">English Sentence</p>
                <p className="text-[22px] sm:text-[28px] font-bold leading-snug text-white">
                  &ldquo;{currentExample.affirmative.en}&rdquo;
                </p>
                <div className="mt-4 pt-4 border-t border-white/8">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/35 font-extrabold mb-2">हिंदी में अर्थ</p>
                  <p className="text-[17px] text-white/60">{currentExample.affirmative.hi}</p>
                </div>
              </div>

              {/* Guided Flow Status */}
              {guidedActive && currentForm && (
                <div className="dark-card-page p-4 text-center">
                  <p className="text-[11px] font-bold text-brand-300 uppercase tracking-wider mb-2">
                    Listening — {currentForm.label}
                  </p>
                  <p className="text-xs text-white/40">
                    Repetition {guidedRepeatCount + 1} of 3
                  </p>
                  <div className="flex items-center justify-center gap-1.5 mt-3">
                    {[0, 1, 2].map(i => (
                      <div key={i} className={`w-2 h-2 rounded-full transition-all ${
                        i < guidedRepeatCount ? 'bg-brand-400' : i === guidedRepeatCount ? 'bg-brand-400 animate-pulse' : 'bg-white/15'
                      }`} />
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Sentence Buttons */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-white/30 uppercase tracking-wider">Individual Listen</p>
                {FORM_TYPES.map(form => {
                  const formId = `${currentExample.id}-${form.suffix}`;
                  const sentenceData = currentExample[form.key];
                  return (
                    <SentenceRow
                      key={form.key}
                      form={form}
                      en={sentenceData.en}
                      hi={sentenceData.hi}
                      isPlaying={playingFormId === formId}
                      isCompleted={completedForms.has(formId)}
                      onListen={() => handleListenForm(currentExample.id, sentenceData.en, sentenceData.hi, form.suffix)}
                    />
                  );
                })}
              </div>

              {/* Guided Listen & Repeat Button */}
              <div className="space-y-3">
                {guidedActive ? (
                  <button
                    onClick={stopGuided}
                    className="w-full bg-white/5 border border-white/15 text-white/70 font-bold py-3.5 rounded-xl text-sm active:scale-[.98] transition-all hover:bg-white/10 flex items-center justify-center gap-2"
                  >
                    <Square size={14} fill="currentColor" />
                    Stop Guided Practice
                  </button>
                ) : (
                  <button
                    onClick={startGuided}
                    className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl flex items-center justify-center gap-2"
                  >
                    <Volume2 size={16} />
                    Listen & Repeat — All 3 Forms
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* Next Example */}
              {!guidedActive && (
                <button
                  onClick={() => {
                    setCompletedExamples(prev => new Set(prev).add(currentExample.id));
                    if (currentExampleIdx < examples.length - 1) {
                      setCurrentExampleIdx(i => i + 1);
                      setGuidedSentenceIdx(0);
                      setGuidedRepeatCount(0);
                    } else {
                      setPhase('test');
                    }
                  }}
                  className="w-full bg-white/[0.04] border border-white/[0.08] text-white/60 font-bold py-3.5 text-sm rounded-xl hover:bg-white/[0.08] transition-colors flex items-center justify-center gap-2"
                >
                  {currentExampleIdx < examples.length - 1 ? 'Next Example →' : 'Take Test →'}
                  <ChevronRight size={16} />
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-white/40 text-sm">No examples available for this day.</p>
              <button onClick={() => setPhase('test')} className="mt-4 text-brand-300 font-semibold text-sm">Skip to Test →</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // TEST PHASE
  // ══════════════════════════════════════
  if (phase === 'test') {
    const currentQ = testQuestions[currentQuestionIdx];
    return (
      <div className="flex flex-col min-h-dvh animate-fade-in">
        <div className="sticky top-0 z-10 dark-glass-nav px-4 py-3">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <button onClick={() => setPhase('practice')} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors">
              <ArrowLeft size={16} className="text-white/60" />
            </button>
            <div className="text-center">
              <p className="text-xs font-bold text-brand-300">Mini Test</p>
              <p className="text-[10px] text-white/30">{currentQuestionIdx + 1}/{testQuestions.length}</p>
            </div>
            <div className="w-8" />
          </div>
          <div className="mt-2 h-1.5 bg-white/8 rounded-full overflow-hidden max-w-lg mx-auto">
            <div className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
              style={{ width: `${testQuestions.length > 0 ? ((currentQuestionIdx + 1) / testQuestions.length) * 100 : 0}%` }} />
          </div>
        </div>
        <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6 pb-24">
          {currentQ ? (
            <>
              <div className="text-center">
                <p className="text-sm text-white/50 mb-4">{currentQ.sentence}</p>
              </div>
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = option === currentQ.correctAnswer;
                  const showResult = selectedAnswer !== null;
                  return (
                    <button key={idx} onClick={() => handleAnswerSelect(option)} disabled={!!selectedAnswer}
                      className={`w-full p-4 rounded-xl text-left text-sm font-semibold transition-all ${
                        showResult
                          ? isCorrect ? 'bg-emerald-500/20 border-2 border-emerald-500/40 text-emerald-300'
                            : isSelected ? 'bg-red-500/20 border-2 border-red-500/40 text-red-300'
                            : 'bg-white/5 border border-white/10 text-white/30'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}>
                      {option}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="text-center py-12"><p className="text-white/40 text-sm">Generating questions...</p></div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════
  // COMPLETE PHASE
  // ══════════════════════════════════════
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center animate-fade-in pb-24">
      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5 shadow-lg ${
        testPassed ? 'bg-gradient-to-br from-success-400 to-emerald-600 shadow-glow-success' : 'bg-gradient-to-br from-amber-400 to-orange-500'
      }`}>
        {testPassed ? <Check size={32} strokeWidth={3} className="text-white" /> : '📚'}
      </div>
      <h1 className="text-2xl font-extrabold text-white">{testPassed ? 'Day Complete!' : 'Keep Practicing!'}</h1>
      <p className="text-white/50 mt-2 text-sm">
        {testPassed ? `Day ${day.day} completed! Score: ${testScore}%` : `Score: ${testScore}% — You need 60% to pass. Try again!`}
      </p>
      {testPassed && (
        <div className="mt-4 flex items-center gap-3 w-full max-w-xs">
          <div className="text-center"><p className="text-2xl font-extrabold text-white">{day.day}</p><p className="text-[10px] text-white/30 font-bold">/ 30</p></div>
          <div className="flex-1 h-2 bg-white/8 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full" style={{ width: `${(day.day / 30) * 100}%` }} />
          </div>
        </div>
      )}
      <div className="mt-6 w-full max-w-xs space-y-3">
        {testPassed ? (
          <>
            {(!hasFullAccess && day.isFree) ? (
              <>
                <button onClick={() => navigate('/pricing')} className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl">Unlock All 30 Days</button>
                <button onClick={() => navigate('/journey')} className="w-full bg-white/5 border border-white/10 text-white/70 font-bold py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors">View Full Journey</button>
              </>
            ) : (
              <>
                {day.day < 30 && (
                  <button onClick={() => navigate(`/journey/${day.day + 1}`)} className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl flex items-center justify-center gap-2">
                    Start Day {day.day + 1} <ChevronRight size={16} />
                  </button>
                )}
                <button onClick={() => navigate('/journey')} className="w-full bg-white/5 border border-white/10 text-white/70 font-bold py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors">Back to Journey</button>
              </>
            )}
          </>
        ) : (
          <>
            <button onClick={() => { setPhase('practice'); setCurrentQuestionIdx(0); setSelectedAnswer(null); setTestScore(0); setTestPassed(false); setTestQuestions([]); }} className="w-full btn-premium btn-premium-gradient py-4 text-sm rounded-xl">Try Again</button>
            <button onClick={() => navigate('/journey')} className="w-full bg-white/5 border border-white/10 text-white/70 font-bold py-3.5 rounded-xl text-sm hover:bg-white/10 transition-colors">Back to Journey</button>
          </>
        )}
      </div>
    </div>
  );
}
