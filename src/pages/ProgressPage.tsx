import { allCourses } from '../data/content';
import { computeStreak, getProgress } from '../lib/progress';
import { checkBadges } from '../config/badges';

export default function ProgressPage() {
  const progress = getProgress();
  const sentencesDone = Object.keys(progress.completedSentences).length;
  const lessonsDone = Object.keys(progress.completedLessons).length;
  const streak = computeStreak(progress.dailyActivity);
  const minutes = Math.max(sentencesDone * 2, 0);

  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const today = new Date();
  const monday = new Date(today);
  const dow = (today.getDay() + 6) % 7;
  monday.setDate(today.getDate() - dow);
  const weekKeys = weekDays.map((_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your English learning journey</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <span className="text-3xl">📚</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{lessonsDone}</p>
          <p className="text-xs text-gray-500">Lessons Done</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">💬</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{sentencesDone}</p>
          <p className="text-xs text-gray-500">Sentences Practiced</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">🔥</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">⏱️</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">~{minutes}</p>
          <p className="text-xs text-gray-500">Minutes Practiced</p>
        </div>
      </div>

      {/* ══════════ BADGES ══════════ */}
      {(() => {
        // Compute courseLessonCounts for course-based badges
        const courseLessonCounts: Record<string, number> = {};
        for (const course of allCourses) {
          const completed = course.lessons.filter((l) => {
            if (progress.completedLessons[l.id]) return true;
            const ids = l.sentences.map((s) => s.id);
            return ids.length > 0 && ids.every((id) => progress.completedSentences[id]);
          }).length;
          if (completed > 0) courseLessonCounts[course.id] = completed;
        }
        const badgeChecks = checkBadges(progress, courseLessonCounts);
        const earnedCount = badgeChecks.filter((b) => b.earned).length;
        return (
          <div className="card-premium p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="font-bold text-gray-900">Achievements</h2>
                <p className="text-[11px] text-gray-500 mt-0.5">{earnedCount} of {badgeChecks.length} unlocked</p>
              </div>
              <span className="text-2xl">🏆</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {badgeChecks.map(({ badge, earned }) => (
                <div
                  key={badge.id}
                  className={`relative flex flex-col items-center p-3 rounded-xl transition-all ${
                    earned
                      ? 'bg-gradient-to-b from-brand-50 to-accent-50 border border-brand-100'
                      : 'bg-gray-50 border border-gray-100 opacity-50 grayscale'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-1.5 ${
                      earned
                        ? `bg-gradient-to-br ${badge.gradient} shadow-md`
                        : 'bg-gray-200'
                    }`}
                  >
                    {badge.emoji}
                  </div>
                  <p className="text-[11px] font-bold text-gray-800 text-center leading-tight">{badge.name}</p>
                  <p className="text-[10px] text-gray-400 text-center leading-tight mt-0.5 line-clamp-2">{badge.description}</p>
                  {earned && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
                      ✓
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Overall Learning</h2>
        <div className="space-y-4">
          {allCourses.map((course) => {
            const done = course.lessons.filter((l) => {
              if (progress.completedLessons[l.id]) return true;
              const ids = l.sentences.map((s) => s.id);
              return ids.length > 0 && ids.every((id) => progress.completedSentences[id]);
            }).length;
            const pct = course.totalLessons === 0 ? 0 : Math.round((done / course.totalLessons) * 100);
            return (
              <div key={course.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{course.title}</span>
                  <span className="text-gray-500">{done} / {course.totalLessons}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">This Week</h2>
        <div className="flex justify-between">
          {weekDays.map((day, i) => {
            const active = progress.dailyActivity.includes(weekKeys[i]);
            return (
              <div key={`${day}-${i}`} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-400">{day}</span>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${active ? 'bg-brand-100 text-brand-700 font-bold' : 'bg-gray-100 text-gray-300'}`}>
                  {active ? '✓' : ''}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card p-5 text-center">
        <span className="text-4xl">💪</span>
        <h3 className="font-bold text-gray-900 mt-2">Keep Going!</h3>
        <p className="text-sm text-gray-500 mt-1">Practice 10-15 minutes daily for best results</p>
      </div>
    </div>
  );
}
