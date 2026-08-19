import { allCourses } from '../data/content';

export default function ProgressPage() {
  const completed = 5; // demo

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Progress</h1>
        <p className="text-gray-500 mt-1">Track your English learning journey</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <span className="text-3xl">📚</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{completed}</p>
          <p className="text-xs text-gray-500">Lessons Done</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">💬</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{completed * 5}</p>
          <p className="text-xs text-gray-500">Sentences Practiced</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">🔥</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">3</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="card p-4 text-center">
          <span className="text-3xl">⏱️</span>
          <p className="text-2xl font-bold text-gray-900 mt-2">~{completed * 10}</p>
          <p className="text-xs text-gray-500">Minutes Practiced</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Overall Learning</h2>
        <div className="space-y-4">
          {allCourses.map((course) => (
            <div key={course.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">{course.title}</span>
                <span className="text-gray-500">0 / {course.totalLessons}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Practice Streak */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">This Week</h2>
        <div className="flex justify-between">
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400">{day}</span>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${i < 3 ? 'bg-brand-100 text-brand-700 font-bold' : 'bg-gray-100 text-gray-300'}`}>
                {i < 3 ? '✓' : ''}
              </div>
            </div>
          ))}
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
