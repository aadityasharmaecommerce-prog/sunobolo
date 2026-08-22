import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSentenceAudio } from '../hooks/useSentenceAudio';
import { getProgress, markSentenceComplete } from '../lib/progress';
import { ArrowLeft, Play, Square, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isTenseUnlocked } from '../data/tenses';

const tensesPromise = import('../data/tenses').then((m) => m.allTenses);

const FORM_CONFIG = {
  affirmative: { icon: '✅', label: 'Affirmative', color: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' },
  negative: { icon: '❌', label: 'Negative', color: 'bg-red-500/10 border-red-500/20 text-red-300' },
  interrogative: { icon: '❓', label: 'Interrogative', color: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
  whyQuestion: { icon: '💡', label: 'Why Question', color: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
} as const;

type FormType = keyof typeof FORM_CONFIG;

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
    <div className={`rounded-xl border p-3.5 ${config.color} ${isCompleted ? 'ring-2 ring-emerald-500/30' : ''} transition-all`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-xs">{config.icon}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">{config.label}</span>
          </div>
          <p className="text-[15px] font-extrabold text-white leading-snug">{en}</p>
          <p className="text-xs text-white/40 mt-1 leading-relaxed">{hi}</p>
        </div>
        <button
          onClick={onListen}
          disabled={isPlaying}
          className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-red-500/20 text-red-400 ring-2 ring-red-500/30'
              : 'bg-white/10 text-white/50 hover:bg-brand-500/20 hover:text-brand-300 border border-white/10'
          }`}
        >
          {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
        </button>
      </div>
    </div>
  );
}

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
        <span className="text-xs font-extrabold text-white/30">EXAMPLE {index + 1}</span>
        <span className="text-xs text-white/15">—</span>
        <span className="text-xs font-semibold text-white/50">{example.label}</span>
        {allDone && (
          <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/15 px-1.5 py-0.5 rounded-full">✓ Done</span>
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

export default function TenseLesson() {
  const { tenseId } = useParams<{ tenseId: string }>();
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const hasFullAccess = subscription.active;
  const isFreeAccess = !hasFullAccess && !isTenseUnlocked(tenseId || '');

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

  const totalForms = examples.length * 4;
  const doneCount = examples.reduce((sum: number, ex: any) => {
    const forms = ['affirmative', 'negative', 'interrogative', 'whyQuestion'];
    return sum + forms.filter((f) => completedForms.has(`${ex.id}-${f.charAt(0)}`)).length;
  }, 0);

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
          <div className="w-12 h-12 border-4 border-brand-500/30 border-t-brand-400 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-white/40">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (!tense) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
        <h2 className="text-xl font-extrabold text-white">Tense not found</h2>
        <button onClick={() => navigate('/tenses')} className="mt-4 text-brand-300 font-semibold text-sm">
          Back to Tenses
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] animate-fade-in">
      {/* Top bar */}
      <div className="sticky top-0 z-10 dark-glass-nav px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <button
            onClick={() => { stop(); navigate('/tenses'); }}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors"
          >
            <ArrowLeft size={16} className="text-white/60" />
          </button>
          <div className="text-center">
            <p className="text-xs font-bold text-brand-300">{tense.title}</p>
            <p className="text-[10px] text-white/30">{doneCount}/{totalForms} forms done</p>
          </div>
          <div className="w-8" />
        </div>
        <div className="mt-2 h-1.5 bg-white/8 rounded-full overflow-hidden max-w-lg mx-auto">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-500"
            style={{ width: `${totalForms > 0 ? (doneCount / totalForms) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* Grammar explanation block */}
        <div className="dark-card-page p-4">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="w-full flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">📘</span>
              <span className="text-sm font-extrabold text-white">{tense.title}</span>
            </div>
            {showExplanation ? <ChevronUp size={16} className="text-white/40" /> : <ChevronDown size={16} className="text-white/40" />}
          </button>
          {showExplanation && (
            <div className="mt-3 space-y-2 text-xs text-white/60">
              <p><span className="font-bold text-white/80">When to use:</span> {tense.explanation.when}</p>
              <p><span className="font-bold text-white/80">Structure:</span> <code className="bg-white/5 px-1.5 py-0.5 rounded font-mono text-[11px] border border-white/8">{tense.pattern}</code></p>
              <p className="text-white/45">{tense.explanation.hindi}</p>
            </div>
          )}
        </div>

        {/* Example groups */}
        {isFreeAccess ? (
          <div className="relative">
            {examples.length > 0 && (
              <ExampleGroup
                key={examples[0].id}
                example={examples[0]}
                index={0}
                completedForms={completedForms}
                playingFormId={playingFormId}
                onListenForm={handleListenForm}
              />
            )}
            <div className="relative mt-4">
              <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-2xl z-10 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/15 flex items-center justify-center mb-3">
                    <Lock size={24} className="text-indigo-400" />
                  </div>
                  <h3 className="text-base font-extrabold text-white">Full access required</h3>
                  <p className="text-xs text-white/40 mt-1">Subscribe to unlock all 12 tenses</p>
                  <button
                    onClick={() => navigate('/pricing')}
                    className="mt-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
                  >
                    Get Full Access →
                  </button>
                </div>
              </div>
              <div className="opacity-30 pointer-events-none">
                {examples.slice(1).map((example: any, index: number) => (
                  <ExampleGroup
                    key={example.id}
                    example={example}
                    index={index + 1}
                    completedForms={new Set()}
                    playingFormId={null}
                    onListenForm={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          examples.map((example: any, index: number) => (
            <ExampleGroup
              key={example.id}
              example={example}
              index={index}
              completedForms={completedForms}
              playingFormId={playingFormId}
              onListenForm={handleListenForm}
            />
          ))
        )}
      </div>
    </div>
  );
}
