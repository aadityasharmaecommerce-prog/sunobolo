/**
 * SunoBolo — 30-Day English Grammar Journey Overview
 *
 * Full roadmap with:
 * - Progress summary
 * - Phase sections with all 30 days
 * - Locked day preview on click
 * - Conversion CTA for free users
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { JOURNEY_DAYS, PHASES, TOTAL_DAYS, FREE_DAYS, type JourneyDay } from '../data/journey';
import { ArrowLeft, Lock, Check, ChevronRight, Play, Trophy, Target, X, BookOpen, Mic, Headphones, PenTool, Award } from 'lucide-react';

interface DayProgress {
  day: number;
  status: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  score: number | null;
  attempts: number;
}

const PHASE_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  foundation: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  confidence: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', dot: 'bg-blue-400' },
  mastery: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', dot: 'bg-purple-400' },
};

const TYPE_ICONS: Record<string, string> = {
  learn: '📘',
  practice: '🎤',
  mixed: '🔄',
  revision: '📝',
  assessment: '🏆',
};

const PHASE_FEATURES = [
  { icon: BookOpen, label: 'Grammar explanation' },
  { icon: Headphones, label: 'Real-life sentences' },
  { icon: Mic, label: 'Speaking practice' },
  { icon: PenTool, label: 'Practice exercises' },
  { icon: Award, label: 'Mini test' },
];

export default function Journey() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewDay, setPreviewDay] = useState<JourneyDay | null>(null);

  const hasFullAccess = subscription.active;

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/journey/progress', { credentials: 'include' });
      const data = await res.json();
      setProgress(data.progress || []);
    } catch {
      // Use empty progress on error
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getDayStatus = (day: number): DayProgress => {
    const existing = progress.find(p => p.day === day);
    if (existing) return existing;
    if (day === 1) return { day, status: 'unlocked', score: null, attempts: 0 };
    if (day <= FREE_DAYS) return { day, status: 'unlocked', score: null, attempts: 0 };
    const prevStatus = getDayStatus(day - 1);
    if (prevStatus.status === 'completed') return { day, status: 'unlocked', score: null, attempts: 0 };
    return { day, status: 'locked', score: null, attempts: 0 };
  };

  const completedCount = progress.filter(p => p.status === 'completed').length;
  const progressPct = Math.round((completedCount / TOTAL_DAYS) * 100);

  const nextDay = JOURNEY_DAYS.find(d => {
    const s = getDayStatus(d.day);
    return s.status === 'unlocked' || s.status === 'in_progress';
  });

  const phaseGroups = PHASES.map(phase => ({
    ...phase,
    days: JOURNEY_DAYS.filter(d => d.phase === phase.id),
  }));

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <img src="/images/logo.png" alt="SunoBolo" className="h-12 w-auto object-contain animate-pulse-soft" style={{ filter: 'drop-shadow(0 2px 8px rgba(99,102,241,0.2))' }} />
        <p className="text-sm text-white/40 font-medium">Loading Journey...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-24 min-h-[50vh]">
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
            <Target size={20} className="text-white/80" />
            <span className="text-white/70 text-xs font-bold uppercase tracking-wider">30-Day Journey</span>
          </div>
          <h1 className="text-2xl font-extrabold">
            {user ? `${user.name}'s English Journey` : '30-Day English Grammar Journey'}
          </h1>
          <p className="text-white/70 text-sm mt-1">Grammar + Real Sentences + Speaking + Tests</p>
          <p className="text-white/40 text-xs mt-1.5">A structured day-by-day learning program — different from the Grammar Library (/tenses)</p>
        </div>
      </div>

      {/* Progress Summary */}
      <div className="dark-card p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-white/40 font-semibold">Your Progress</p>
            <p className="text-2xl font-extrabold text-white">{completedCount} <span className="text-sm font-normal text-white/40">/ {TOTAL_DAYS} Days</span></p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center">
            <span className="text-xl font-extrabold text-white">{progressPct}%</span>
          </div>
        </div>
        <div className="h-2 bg-white/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {nextDay && (
          <button
            onClick={() => navigate(`/journey/${nextDay.day}`)}
            className="mt-4 w-full btn-premium btn-premium-gradient py-3.5 text-sm rounded-xl flex items-center justify-center gap-2"
          >
            <Play size={16} fill="currentColor" />
            {getDayStatus(nextDay.day).status === 'in_progress' ? `Continue Day ${nextDay.day}` : `Start Day ${nextDay.day}`}
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* What you'll learn preview */}
      {!hasFullAccess && (
        <div className="dark-card p-5">
          <h3 className="text-sm font-extrabold text-white mb-3">What's inside each day:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {PHASE_FEATURES.map(f => (
              <div key={f.label} className="flex flex-col items-center text-center gap-1.5 p-2 rounded-lg bg-white/[0.03]">
                <f.icon size={18} className="text-brand-400" strokeWidth={2} />
                <span className="text-[10px] text-white/50 font-medium leading-tight">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Grid */}
      <div className="space-y-6">
        {phaseGroups.map((phase) => {
          const colors = PHASE_COLORS[phase.id];
          const phaseCompleted = phase.days.filter(d => getDayStatus(d.day).status === 'completed').length;

          return (
            <div key={phase.id} className="space-y-3">
              {/* Phase Header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${colors.bg} border ${colors.border}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
                  <h2 className={`text-sm font-extrabold ${colors.text}`}>{phase.label}</h2>
                  <span className="text-[10px] text-white/30">Days {phase.days[0]?.day}–{phase.days[phase.days.length - 1]?.day}</span>
                </div>
                <span className={`text-[10px] font-bold ${colors.text}`}>
                  {phaseCompleted}/{phase.days.length}
                </span>
              </div>

              {/* Day Cards */}
              <div className="space-y-2">
                {phase.days.map((day) => {
                  const status = getDayStatus(day.day);
                  const isCompleted = status.status === 'completed';
                  const isLocked = status.status === 'locked';
                  const isCurrent = status.status === 'unlocked' || status.status === 'in_progress';
                  const isAccessible = !isLocked && (hasFullAccess || day.isFree);

                  return (
                    <button
                      key={day.day}
                      onClick={() => {
                        if (isAccessible) {
                          navigate(`/journey/${day.day}`);
                        } else {
                          setPreviewDay(day);
                        }
                      }}
                      className={`w-full relative p-4 rounded-xl text-left transition-all active:scale-[0.99] flex items-center gap-4 ${
                        isCompleted
                          ? 'bg-emerald-500/10 border border-emerald-500/20'
                          : isCurrent && isAccessible
                            ? 'bg-brand-500/10 border border-brand-500/20'
                            : isLocked
                              ? 'bg-white/3 border border-white/5 opacity-60'
                              : 'bg-white/5 border border-white/8'
                      }`}
                    >
                      {/* Day number + icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-500/20'
                          : isCurrent
                            ? 'bg-brand-500/20'
                            : 'bg-white/5'
                      }`}>
                        {isCompleted ? (
                          <Check size={20} className="text-emerald-400" strokeWidth={3} />
                        ) : isLocked ? (
                          <Lock size={16} className="text-white/30" />
                        ) : (
                          <span className="text-lg">{TYPE_ICONS[day.type]}</span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white/30">DAY {day.day}</span>
                          {!hasFullAccess && day.isFree && (
                            <span className="text-[8px] font-extrabold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded-full">FREE</span>
                          )}
                          {!hasFullAccess && !day.isFree && isLocked && (
                            <span className="text-[8px] font-extrabold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded-full">PREMIUM</span>
                          )}
                        </div>
                        <p className={`text-sm font-bold leading-tight ${isCompleted ? 'text-emerald-300' : isCurrent ? 'text-white' : 'text-white/50'}`}>
                          {day.title}
                        </p>
                        <p className="text-[11px] text-white/30 mt-0.5">{day.subtitle}</p>
                      </div>

                      {/* Arrow */}
                      {isAccessible ? (
                        <ChevronRight size={16} className="text-white/30 shrink-0" />
                      ) : isLocked ? (
                        <Lock size={12} className="text-white/20 shrink-0" />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA for free users */}
      {!hasFullAccess && (
        <div className="mt-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-center">
          <Trophy size={28} className="text-white/80 mx-auto mb-2" />
          <h3 className="text-white font-extrabold text-lg">Unlock Complete 30-Day Journey</h3>
          <p className="text-white/70 text-sm mt-1">All 30 Days + 12 Tenses + Speaking Practice + Tests</p>
          <button
            onClick={() => navigate('/pricing')}
            className="mt-4 bg-white text-indigo-700 font-bold text-sm px-8 py-3 rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all"
          >
            Get Full Access →
          </button>
        </div>
      )}

      {/* Locked Day Preview Modal */}
      {previewDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewDay(null)}>
          <div className="dark-card-page p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔒</span>
                <div>
                  <p className="text-[10px] font-bold text-white/40">DAY {previewDay.day}</p>
                  <p className="text-sm font-extrabold text-white">{previewDay.title}</p>
                </div>
              </div>
              <button onClick={() => setPreviewDay(null)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60">
                <X size={16} />
              </button>
            </div>

            <p className="text-sm text-white/50 mb-4">{previewDay.description}</p>

            <div className="space-y-2 mb-5">
              <p className="text-xs font-bold text-white/60">Includes:</p>
              {['✓ Grammar explanation', '✓ Real-life sentences', '✓ Speaking practice', '✓ Practice exercises', '✓ Mini test', '✓ Next-day unlock'].map(f => (
                <div key={f} className="flex items-center gap-2 text-sm text-white/50">
                  <Check size={14} className="text-emerald-400 shrink-0" strokeWidth={3} />
                  {f.slice(2)}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setPreviewDay(null); navigate('/pricing'); }}
              className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
            >
              🚀 Unlock Day 2–30
            </button>
            <button
              onClick={() => { setPreviewDay(null); navigate('/journey/1'); }}
              className="w-full mt-2 py-3 text-sm text-white/50 font-semibold hover:text-white/70 transition-colors"
            >
              View Day 1 again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
