import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { getProgress, markSentenceComplete } from '../lib/progress';
import { ArrowLeft, Play, Square, ChevronDown, ChevronUp } from 'lucide-react';

// Lazy-load tenses data
const tensesPromise = import('../data/tenses').then((m) => m.allTenses);

/* ── Form type badge colors ── */
const FORM_CONFIG = {
  affirmative: { icon: '✅', label: 'Affirmative', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  negative: { icon: '❌', label: 'Negative', color: 'bg-red-50 border-red-200 text-red-700' },
  interrogative: { icon: '❓', label: 'Interrogative', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  whyQuestion: { icon: '💡', label: 'Why Question', color: 'bg-purple-50 border-purple-200 text-purple-700' },
} as const;

type FormType = keyof typeof FORM_CONFIG;

/* ── Single form card ── */
function FormCard({
  formType,
  en,
  hi,
  onListen,
  isPlaying,
  isCompleted,
}: {
  formType: FormType;
  en: string;
  hi: string;
  onListen: () => void;
  isPlaying: boolean;
  isCompleted: boolean;
}) {
  const config = FORM_CONFIG[formType];
  return (
    <div className={`rounded-xl border p-3.5 ${config.color} shadow-sm ring-1 ring-black/[0.03] ${isCompleted ? 'ring-2 ring-success-300' : ''} transition-all`}>  
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs">{config.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{config.label}</span>
          </div>
          <p className="text-[15px] font-extrabold text-gray-900 leading-snug">{en}</p>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{hi}</p>
        </div>
        <button
          onClick={onListen}
          disabled={isPlaying}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-red-100 text-red-600 ring-2 ring-red-200'
              : 'bg-white text-gray-500 hover:bg-brand-50 hover:text-brand-600 shadow-sm ring-1 ring-gray-200/60'
          }`}
        >
          {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}

/* ── Example group (4 forms) ── */
function ExampleGroup({
  example,
  index,
  completedForms,
  onListenForm,
  playingFormId,
}: {
  example: any;
  index: number;
  completedForms: Set<string>;
  onListenForm: (formType: FormType, en: string, hi: string, id: string) => void;
  playingFormId: string | null;
}) {
  const forms: FormType[] = ['affirmative', 'negative', 'interrogative', 'whyQuestion'];
  const formIds = forms.map((f) => `${example.id}-${f.charAt(0)}`);
  const allDone = formIds.every((id) => completedForms.has(id));

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-extrabold text-gray-400">EXAMPLE {index + 1}</span>
        <span className="text-xs text-gray-300">—</span>
        <span className="text-xs font-semibold text-gray-500">{example.label}</span>
        {allDone && (
          <span className="text-[10px] font-bold text-success-600 bg-success-50 px-1.5 py-0.5 rounded-full">✓ Done</span>
        )}
      </div>
      <div className="grid gap-2">
        {forms.map((formType) => {
          const form = example[formType];
          const formId = `${example.id}-${formType.charAt(0)}`;
          return (
            <FormCard
              key={formType}
              formType={formType}
              en={form.en}
              hi={form.hi}
              isPlaying={playingFormId === formId}
              isCompleted={completedForms.has(formId)}
              onListen={() => onListenForm(formType, form.en, form.hi, formId)}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Main Lesson Page ── */
export default function TenseLesson() {
  const { tenseId } = useParams<{ tenseId: string }>();
  const navigate = useNavigate();

  const [tenses, setTenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedForms, setCompletedForms] = useState<Set<string>>(new Set());
  const [playingFormId, setPlayingFormId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(true);

  const mountedRef = useRef(true);
  const { status, listenThreeTimes, stop } = useSentenceAudio();

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stop();
    };
  }, []);

  useEffect(() => {
    tensesPromise.then((data) => {
      setTenses(data);
      setLoading(false);
    });
  }, []);

  // Load existing progress
  useEffect(() => {
    const progress = getProgress();
    const completed = new Set<string>();
    Object.keys(progress.completedSentences).forEach((id) => {
      if (id.startsWith('sp-') || id.startsWith('pc-') || id.startsWith('pp-') ||
          id.startsWith('ppc-') || id.startsWith('spt-') || id.startsWith('pcst-') ||
          id.startsWith('ppst-') || id.startsWith('ppcst-') || id.startsWith('sf-') ||
          id.startsWith('fc-') || id.startsWith('fpf-') || id.startsWith('fpcf-')) {
        completed.add(id);
      }
    });
    setCompletedForms(completed);
  }, []);

  const tense = tenses.find((t) => t.id === tenseId);
  const examples = tense?.examples ?? [];

  // Count completed forms
  const totalForms = examples.length * 4;
  const doneCount = examples.reduce((sum: number, ex: any) => {
    const forms = ['affirmative', 'negative', 'interrogative', 'whyQuestion'];
    return sum + forms.filter((f) => completedForms.has(`${ex.id}-${f.charAt(0)}`)).length;
  }, 0);

  // Map form type to audio file suffix (must match actual filenames)
  const FORM_SUFFIX: Record<string, string> = {
    affirmative: 'aff',
    negative: 'neg',
    interrogative: 'int',
    whyQuestion: 'wq',
  };

  const handleListenForm = useCallback(async (formType: FormType, en: string, hi: string, formId: string) => {
    if (status === 'playing' || status === 'loading') {
      stop();
      setPlayingFormId(null);
      return;
    }

    setPlayingFormId(formId);

    // Use correct audio filename: sp-1-aff.mp3 (not sp-1-a.mp3)
    const audioId = `${formId.split('-').slice(0, -1).join('-')}-${FORM_SUFFIX[formType] || formType.charAt(0)}`;
    await listenThreeTimes(
      audioId,
      'tenses',
      en,
      (count) => {
        if (count >= 1) {
          setCompletedForms((prev) => {
            const next = new Set(prev);
            next.add(formId);
            return next;
          });
          markSentenceComplete(formId, 'tenses', tenseId || '', 0);
        }
      },
      hi,
      () => {
        if (mountedRef.current) {
          setPlayingFormId(null);
        }
      },
    );
  }, [status, stop, listenThreeTimes, tenseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!tense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-extrabold text-gray-900">Tense not found</h2>
        <button onClick={() => navigate('/tenses')} className="mt-4 text-brand-600 font-semibold text-sm">
          Back to Tenses
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => { stop(); navigate('/tenses'); }}
            className="w-8 h-8 rounded-full bg-surface-50 flex items-center justify-center hover:bg-surface-100 transition-colors"
          >
            <ArrowLeft size={16} className="text-gray-600" />
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-brand-700">{tense.title}</p>
            <p className="text-[10px] text-gray-400">{doneCount}/{totalForms} forms done</p>
          </div>
          <div className="w-8" />
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-surface-100 rounded-full overflow-hidden max-w-lg mx-auto">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${totalForms > 0 ? (doneCount / totalForms) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Grammar explanation block */}
        <div className="bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 rounded-2xl p-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📘</span>
              <span className="text-sm font-extrabold text-brand-800">{tense.title}</span>
            </div>
            {showExplanation ? <ChevronUp size={16} className="text-brand-400" /> : <ChevronDown size={16} className="text-brand-400" />}
          </button>
          {showExplanation && (
            <div className="mt-3 space-y-2 text-xs text-brand-700">
              <p><span className="font-bold">When to use:</span> {tense.explanation.when}</p>
              <p><span className="font-bold">Structure:</span> <code className="bg-brand-100 px-1.5 py-0.5 rounded font-mono text-[11px]">{tense.pattern}</code></p>
              <p className="text-brand-600">{tense.explanation.hindi}</p>
            </div>
          )}
        </div>

        {/* Example groups */}
        {examples.map((example: any, index: number) => (
          <ExampleGroup
            key={example.id}
            example={example}
            index={index}
            completedForms={completedForms}
            playingFormId={playingFormId}
            onListenForm={handleListenForm}
          />
        ))}
      </div>
    </div>
  );
}
