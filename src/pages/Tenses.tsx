import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, BookOpen, ChevronRight, Lock } from 'lucide-react';
import { getProgress } from '../lib/progress';
import { useAuth } from '../lib/auth';
import { PREVIEW_TENSE_COUNT, isTenseUnlocked } from '../data/tenses';

// Lazy-load tenses data
const tensesPromise = import('../data/tenses').then((m) => m.allTenses);

const GROUP_INFO = {
  present: { label: 'Present Tenses', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  past: { label: 'Past Tenses', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
  future: { label: 'Future Tenses', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-200', dot: 'bg-purple-500' },
} as const;

export default function Tenses() {
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const [tenses, setTenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tensesPromise.then((data) => {
      setTenses(data);
      setLoading(false);
    });
  }, []);

  const progress = getProgress();
  const groups = ['present', 'past', 'future'] as const;
  const hasFullAccess = subscription.active;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-sm text-gray-500">Loading Tenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-indigo-800 text-white p-6">
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
        >
          <ArrowLeft size={16} />
        </button>
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-white/80" />
            <span className="text-white/70 text-xs font-bold uppercase tracking-wider">Grammar</span>
          </div>
          <h1 className="text-2xl font-extrabold">English Tenses</h1>
          <p className="text-white/70 text-sm mt-1">Grammar ko rules ki tarah ratne ke bajay, real sentences ke through samjho aur bolo.</p>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-white/60">12 tenses</span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-white/60">48 examples</span>
            <span className="text-white/30">·</span>
            <span className="text-xs text-white/60">192 forms</span>
          </div>
        </div>
      </div>

      {/* Free preview banner */}
      {!hasFullAccess && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-lg">📘</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-indigo-800">Free Preview: First {PREVIEW_TENSE_COUNT} Tenses</p>
            <p className="text-[11px] text-indigo-600">Present Simple & Present Continuous — try them free!</p>
          </div>
        </div>
      )}

      {/* Tense Groups */}
      {groups.map((group) => {
        const groupTenses = tenses.filter((t) => t.group === group);
        const info = GROUP_INFO[group];
        return (
          <div key={group} className="space-y-3">
            {/* Group header */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${info.bg} border`}>
              <div className={`w-2 h-2 rounded-full ${info.dot}`} />
              <h2 className={`text-sm font-extrabold ${info.color}`}>{info.label}</h2>
            </div>

            {/* Tenses in group */}
            <div className="space-y-2 pl-1">
              {groupTenses.map((tense) => {
                const doneCount = tense.examples?.reduce((sum: number, ex: any) => {
                  const forms = ['affirmative', 'negative', 'interrogative', 'whyQuestion'];
                  return sum + forms.filter((f) => progress.completedSentences[`${ex.id}-${f.charAt(0)}`]).length;
                }, 0) ?? 0;
                const totalForms = (tense.examples?.length ?? 0) * 4;
                const isComplete = doneCount === totalForms && totalForms > 0;

                return (
                  <button
                    key={tense.id}
                    onClick={() => {
                      if (hasFullAccess || isTenseUnlocked(tense.id)) {
                        navigate(`/tenses/${tense.id}`);
                      } else {
                        navigate('/pricing');
                      }
                    }}
                    className={`w-full text-left card-premium card-interactive !rounded-xl p-4 group relative overflow-hidden ${
                      !hasFullAccess && !isTenseUnlocked(tense.id) ? 'bg-gray-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-extrabold shrink-0 ${
                          isComplete
                            ? 'bg-success-100 text-success-700'
                            : 'bg-surface-50 text-surface-600 group-hover:bg-brand-50 group-hover:text-brand-700'
                        } transition-colors`}
                      >
                        {isComplete ? <Check size={18} strokeWidth={3} /> : totalForms}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors text-sm">
                            {tense.title}
                          </h3>
                          {!hasFullAccess && isTenseUnlocked(tense.id) && (
                            <span className="text-[9px] font-extrabold text-success-700 bg-success-50 border border-success-200 px-1.5 py-0.5 rounded-full">FREE</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">
                          {tense.subtitle}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                            {tense.pattern}
                          </span>
                          {doneCount > 0 && (
                            <span className="text-[10px] text-success-600 font-semibold">
                              {doneCount}/{totalForms}
                            </span>
                          )}
                        </div>
                      </div>
                      {!hasFullAccess && !isTenseUnlocked(tense.id) ? (
                        <div className="flex flex-col items-center gap-1 shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                            <Lock size={14} className="text-indigo-500" />
                          </div>
                          <span className="text-[9px] font-bold text-indigo-500">PREMIUM</span>
                        </div>
                      ) : (
                        <ChevronRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* CTA for free users */}
      {!hasFullAccess && (
        <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-center">
          <h3 className="text-white font-extrabold text-base">Unlock All 12 Tenses</h3>
          <p className="text-white/70 text-xs mt-1">Past, Future, Perfect tenses + 192 practice forms</p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-3 bg-white text-indigo-700 font-bold text-sm px-8 py-3 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Get Full Access →
          </button>
        </div>
      )}
    </div>
  );
}
