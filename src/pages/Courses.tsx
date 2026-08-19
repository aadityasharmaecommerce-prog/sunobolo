import { useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';
import { useAuth } from '../lib/auth';

export default function Courses() {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center pt-2">
        <p className="kicker">Choose a course</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">All Courses</h1>
        <p className="text-gray-500 text-sm mt-1.5">
          {subscription.active
            ? '✅ Full access active — all courses unlocked'
            : 'Free trial available · Full access with any plan'}
        </p>
      </div>

      <div className="grid gap-3">
        {allCourses.map((course, i) => (
          <button
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className={`card-premium !rounded-2xl p-4 text-left group transition-all animate-fade-up-${Math.min(i + 1, 4)}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                  course.color === 'accent'
                    ? 'bg-gradient-to-br from-accent-100 to-accent-200'
                    : 'bg-gradient-to-br from-brand-100 to-brand-200'
                }`}
              >
                {course.icon}
              </div>
              {course.isFree ? (
                <span className="text-[9px] font-extrabold text-success-700 bg-success-100 border border-success-200 px-2 py-0.5 rounded-full">FREE</span>
              ) : (
                <span className="text-[9px] font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">🔒 PREMIUM</span>
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
          </button>
        ))}
      </div>

      {!subscription.active && (
        <div className="card-premium !rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600 mb-3">Unlock all 5,000+ sentences</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-2xl"
          >
            See Plans →
          </button>
        </div>
      )}
    </div>
  );
}
