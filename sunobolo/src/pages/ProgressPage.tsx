import { allCourses } from '../data/content';
import { computeStreak, getProgress } from '../lib/progress';

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
