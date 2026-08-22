import { courseMetadata } from '../data/content';
import { computeStreak, getProgress } from '../lib/progress';
import { checkBadges } from '../config/badges';
import { TrendingUp, BookOpen, Flame, Clock, Award } from 'lucide-react';

export default function ProgressPage() {
  const progress = getProgress();
  const sentencesDone = Object.keys(progress.completedSentences).length;
  const lessonsDone = Object.keys(progress.completedLessons).length;
  const streak = computeStreak(progress.dailyActivity);
  const minutes = Math.max(sentencesDone * 2, 0);
  const badgeChecks = checkBadges(progress);
  const earnedBadges = badgeChecks.filter(b => b.earned);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const monday = new Date(today);
  const dow = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dow);
  const weekKeys = weekDays.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${dd}`;
  });
  const weekActivity = weekKeys.map(k => progress.dailyActivity.includes(k));
  const isToday = (i: number) => i === dow;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center pt-2">
        <p className="kicker">Your progress</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Learning Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: sentencesDone, label: 'Sentences Done', Icon: BookOpen, color: 'text-brand-600', bg: 'bg-brand-50' },
          { value: `${streak}d`, label: 'Day Streak', Icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
          { value: `${minutes}m`, label: 'Practice Time', Icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { value: lessonsDone, label: 'Lessons Done', Icon: TrendingUp, color: 'text-success-600', bg: 'bg-success-50' },
        ].map(s => (
          <div key={s.label} className="card-premium p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mx-auto mb-2`}>
              <s.Icon size={18} className={s.color} strokeWidth={2} />
            </div>
            <p className="text-xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-[11px] text-gray-500 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Weekly Activity */}
      <div className="card-premium p-5">
        <h2 className="font-bold text-gray-900 mb-3">This Week</h2>
        <div className="flex items-center justify-between gap-1">
          {weekDays.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                weekActivity[i]
                  ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white'
                  : isToday(i)
                  ? 'bg-brand-100 text-brand-700 border border-brand-300'
                  : 'bg-surface-100 text-surface-400'
              }`}>
                {weekActivity[i] ? '✓' : day}
              </div>
              <span className={`text-[10px] font-semibold ${isToday(i) ? 'text-brand-700' : 'text-surface-400'}`}>{day}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      {earnedBadges.length > 0 && (
        <div className="card-premium p-5">
          <h2 className="font-bold text-gray-900 mb-3 inline-flex items-center gap-2">
            <Award size={16} strokeWidth={2} className="text-amber-500" />
            Badges Earned
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {earnedBadges.map(bc => (
              <div key={bc.badge.id} className="text-center p-3 bg-surface-50 rounded-xl">
                <div className="text-2xl mb-1">{bc.badge.emoji}</div>
                <p className="text-[11px] font-bold text-gray-900">{bc.badge.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Progress */}
      <div className="card-premium p-5">
        <h2 className="font-bold text-gray-900 mb-3">Course Progress</h2>
        <div className="space-y-3">
          {courseMetadata.map(course => {
            const totalSentences = course.totalSentences;
            // Count completed sentences for this course from progress
            let doneSentences = 0;
            Object.keys(progress.completedSentences).forEach(sentId => {
              if (sentId.startsWith(course.id + '-') && progress.completedSentences[sentId]) {
                doneSentences++;
              }
            });
            const pct = totalSentences > 0 ? (doneSentences / totalSentences) * 100 : 0;
            if (pct === 0) return null;
            return (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-700">{course.title}</span>
                  <span className="text-xs text-gray-500">{doneSentences}/{totalSentences}</span>
                </div>
                <div className="h-2 bg-surface-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
