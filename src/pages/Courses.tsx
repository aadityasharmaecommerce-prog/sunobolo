import { useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';
import { USER_GOALS } from '../data/goals';

export default function Courses() {
  const navigate = useNavigate();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="pt-1">
        <p className="kicker">10+ courses · 4,075+ sentences</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Choose Your Path</h1>
        <p className="text-gray-500 text-sm mt-1.5">Apna goal chuno aur aaj se practice shuru karo</p>
      </div>

      {/* Goals */}
      <section className="card-premium !rounded-2xl p-4 animate-fade-up-1">
        <h2 className="font-bold text-sm text-gray-900 mb-3">My goal is...</h2>
        <div className="grid grid-cols-3 gap-1.5">
          {USER_GOALS.map((goal) => (
            <button
              key={goal.id}
              onClick={() => navigate('/courses')}
              className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-gradient-to-b from-gray-50 to-white border border-gray-100 hover:border-brand-200 hover:from-brand-50 hover:to-accent-50 transition-all text-center active:scale-95 shadow-sm hover:shadow-md"
            >
              <span className="text-lg">{goal.emoji}</span>
              <span className="text-[9px] font-semibold text-gray-700 leading-tight line-clamp-2">{goal.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Level */}
      <section className="card-premium !rounded-2xl p-4 animate-fade-up-2">
        <h2 className="font-bold text-sm text-gray-900 mb-3">What is your current level?</h2>
        <div className="flex gap-2">
          {[
            { id: 'beginner', label: 'Beginner', emoji: '🌱', active: 'from-green-500 to-emerald-600 text-white border-transparent shadow-glow-success', idle: 'bg-white text-gray-700 border-gray-200' },
            { id: 'intermediate', label: 'Intermediate', emoji: '🚀', active: 'from-amber-500 to-orange-600 text-white border-transparent', idle: 'bg-white text-gray-700 border-gray-200' },
            { id: 'advanced', label: 'Advanced', emoji: '🏆', active: 'from-brand-500 to-accent-600 text-white border-transparent', idle: 'bg-white text-gray-700 border-gray-200' },
          ].map((level) => (
            <button
              key={level.id}
              onClick={() => navigate(`/course/${level.id}`)}
              className={`flex-1 py-2.5 px-3 rounded-xl border-2 text-sm font-bold bg-gradient-to-br transition-all hover:-translate-y-0.5 hover:shadow-md active:scale-95 ${level.active}`}
            >
              <span className="block text-base mb-0.5">{level.emoji}</span>
              {level.label}
            </button>
          ))}
        </div>
      </section>

      {/* Course List */}
      <section className="animate-fade-up-3">
        <div className="flex items-end justify-between mb-3 px-0.5">
          <h2 className="text-lg font-extrabold text-gray-900">Available Courses</h2>
          <span className="text-[10px] font-bold text-gray-400">{allCourses.length} courses</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {allCourses.map((course) => (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="card-premium !rounded-2xl p-4 text-left group"
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110 group-hover:-rotate-3 ${
                  course.color === 'accent'
                    ? 'bg-gradient-to-br from-accent-100 to-accent-200'
                    : 'bg-gradient-to-br from-brand-100 to-brand-200'
                }`}>
                  {course.icon}
                </div>
                {course.isFree ? (
                  <span className="text-[9px] font-extrabold text-success-700 bg-success-100 border border-success-200 px-2 py-0.5 rounded-full">FREE</span>
                ) : (
                  <span className="text-sm font-extrabold text-gray-900">{course.price}</span>
                )}
              </div>
              <h3 className="font-extrabold text-gray-900 mt-2.5 group-hover:text-brand-700 transition-colors">{course.title}</h3>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{course.shortDescription}</p>
              <div className="flex items-center gap-2 mt-2.5 text-[10px] font-semibold text-gray-400">
                <span>{course.totalLessons} lessons</span>
                <span>·</span>
                <span>{course.totalSentences} sentences</span>
                <span>·</span>
                <span>~{course.estimatedHours}h</span>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex flex-wrap gap-1">
                  {course.targetAudience.slice(0, 2).map((a) => (
                    <span key={a} className="text-[9px] bg-brand-50 text-brand-700 font-semibold px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-brand-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Open <span aria-hidden>→</span>
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Free Trial */}
      <div className="hero-mesh relative overflow-hidden rounded-2xl text-white p-6 shadow-premium-lg animate-fade-up-4">
        <div className="absolute -left-8 -bottom-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <h3 className="text-lg font-extrabold relative">Not sure where to start?</h3>
        <p className="text-white/80 text-sm mt-1 relative">Try 25 free sentences. No account needed.</p>
        <button
          onClick={() => navigate('/free-trial')}
          className="btn-premium px-6 py-2.5 mt-4 bg-white text-brand-700 font-bold text-sm shadow-lg hover:bg-gray-50 relative"
        >
          Start Free Trial →
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}
