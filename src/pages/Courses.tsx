import { useNavigate } from 'react-router-dom';
import { courseMetadata } from '../data/content';
import { useAuth } from '../lib/auth';
import CourseIcon from '../components/CourseIcon';
import { Lock, Clock, ArrowRight } from 'lucide-react';

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
            ? 'Full access active — all courses unlocked'
            : 'Free trial available · Full access with any plan'}
        </p>
      </div>

      <div className="grid gap-3">
        {courseMetadata.map((course, i) => (
          <button
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className={`card-premium card-interactive !rounded-2xl p-4 text-left group transition-all animate-fade-up-${Math.min(i + 1, 4)}`}
          >
            <div className="flex items-center gap-3">
              <CourseIcon courseId={course.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-gray-900 group-hover:text-brand-700 transition-colors truncate">{course.title}</h3>
                  {course.isFree ? (
                    <span className="text-[10px] font-extrabold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full shrink-0">FREE</span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-surface-500 bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-0.5">
                      <Lock size={8} strokeWidth={2.5} />
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{course.shortDescription}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-gray-400">
                  <span className="inline-flex items-center gap-1">
                    {course.totalLessons} lessons
                  </span>
                  <span>·</span>
                  <span>{course.totalSentences} sentences</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={11} strokeWidth={2} />
                    ~{course.estimatedHours}h
                  </span>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" strokeWidth={2} />
            </div>
          </button>
        ))}
        {/* Tenses Section Card */}
        <button
          onClick={() => navigate('/tenses')}
          className="card-premium card-interactive !rounded-2xl p-4 text-left group transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-gray-900 group-hover:text-brand-700 transition-colors truncate">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">Master all 12 English tenses with real examples</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-gray-400">
                <span>12 lessons</span>
                <span>·</span>
                <span>200+ sentences</span>
                <span>·</span>
                <span>Grammar tips</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-brand-500 transition-colors shrink-0" strokeWidth={2} />
          </div>
        </button>
      </div>

      {!subscription.active && (
        <div className="card-premium !rounded-2xl p-5 text-center">
          <p className="text-sm text-gray-600 mb-3">Unlock all 5,000+ sentences</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-2xl"
          >
            See Plans
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
