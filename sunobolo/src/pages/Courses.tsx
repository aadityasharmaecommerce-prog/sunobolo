import { useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';
import { USER_GOALS } from '../data/goals';

export default function Courses() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Path</h1>
        <p className="text-gray-500 mt-1">Select a learning goal and start practicing</p>
      </div>

      {/* Goals */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">My goal is...</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {USER_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => navigate('/courses')}
              className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 border border-transparent hover:border-brand-200 transition-all text-left"
            >
              <span className="text-lg">{goal.emoji}</span>
              <span className="text-xs font-medium text-gray-700">{goal.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Your Level */}
      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">What is your current level?</h2>
        <div className="flex gap-2">
          {[
            { id: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' },
            { id: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
            { id: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-200' },
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => navigate(`/course/${level.id}`)}
              className={`flex-1 py-2 px-3 rounded-xl border text-sm font-medium ${level.color} hover:opacity-80 transition-opacity`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3">Available Courses</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {allCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="card p-5 text-left hover:shadow-md transition-shadow group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-3 ${
                course.color === 'accent' ? 'bg-accent-100' : 'bg-brand-100'
              }`}>
                {course.icon}
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-brand-700 transition-colors">{course.title}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{course.shortDescription}</p>
              <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                <span>{course.totalLessons} lessons</span>
                <span>·</span>
                <span>{course.totalSentences} sentences</span>
                <span>·</span>
                <span>~{course.estimatedHours}h</span>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {course.targetAudience.slice(0, 2).map((a) => (
                    <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
                {course.isFree ? (
                  <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">Free</span>
                ) : (
                  <span className="text-sm font-bold text-gray-900">{course.price}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Free Trial */}
      <div className="card bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0 p-6">
        <h3 className="text-lg font-bold">Not sure where to start?</h3>
        <p className="text-white/80 text-sm mt-1">Try 25 free sentences. No account needed.</p>
        <button
          onClick={() => navigate('/free-trial')}
          className="mt-4 bg-white text-brand-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Start Free Trial →
        </button>
      </div>

      <div className="h-8" />
    </div>
  );
}