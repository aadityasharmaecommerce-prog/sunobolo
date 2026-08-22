import { useNavigate } from 'react-router-dom';
import { courseMetadata } from '../data/content';
import { useAuth } from '../lib/auth';
import CourseIcon from '../components/CourseIcon';
import { Lock, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function Courses() {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white font-medium transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Back
      </button>

      {/* Header */}
      <div className="text-center pt-2">
        <p className="dark-kicker">Choose a course</p>
        <h1 className="text-2xl font-extrabold text-white mt-1">All Courses</h1>
        <p className="text-white/45 text-sm mt-1.5">
          {subscription.active
            ? 'Full access active — all courses unlocked'
            : 'Free trial available · Full access with any plan'}
        </p>
      </div>

      {/* Course Cards */}
      <div className="grid gap-3">
        {courseMetadata.map((course) => (
          <button
            key={course.id}
            onClick={() => navigate(`/course/${course.id}`)}
            className="dark-card p-4 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <CourseIcon courseId={course.id} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white group-hover:text-brand-300 transition-colors truncate">{course.title}</h3>
                  {course.isFree ? (
                    <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">FREE</span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-white/40 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shrink-0 inline-flex items-center gap-0.5">
                      <Lock size={8} strokeWidth={2.5} />
                      PREMIUM
                    </span>
                  )}
                </div>
                <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">{course.shortDescription}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-white/30">
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
              <ArrowRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
            </div>
          </button>
        ))}

        {/* Tenses Card */}
        <button
          onClick={() => navigate('/tenses')}
          className="dark-card p-4 text-left group active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white group-hover:text-brand-300 transition-colors truncate">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-300 bg-brand-500/15 border border-brand-500/20 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">Master all 12 English tenses with real examples</p>
              <div className="flex items-center gap-3 mt-2 text-[11px] font-semibold text-white/30">
                <span>12 lessons</span>
                <span>·</span>
                <span>200+ sentences</span>
                <span>·</span>
                <span>Grammar tips</span>
              </div>
            </div>
            <ArrowRight size={16} className="text-white/20 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
          </div>
        </button>
      </div>

      {/* Upgrade CTA */}
      {!subscription.active && (
        <div className="dark-card p-5 text-center">
          <Sparkles size={20} className="text-brand-400 mx-auto mb-2" strokeWidth={2} />
          <p className="text-sm text-white/60 mb-3">Unlock all 5,000+ sentences</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl"
          >
            See Plans
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
