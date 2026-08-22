import { useNavigate } from 'react-router-dom';
import { courseMetadata } from '../data/content';
import { useAuth } from '../lib/auth';
import CourseIcon from '../components/CourseIcon';
import { Lock, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function Courses() {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  // Split courses: featured (beginner) + rest
  const featured = courseMetadata.find(c => c.id === 'beginner');
  const rest = courseMetadata.filter(c => c.id !== 'beginner');

  return (
    <div className="space-y-8 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white font-medium transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Back
      </button>

      {/* Header */}
      <div className="text-center pt-2">
        <p className="dark-kicker">Choose a course</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Choose Your English Journey</h1>
        <p className="text-white/40 text-sm mt-1.5 max-w-md mx-auto">
          {subscription.active
            ? 'Full access active — all courses unlocked'
            : 'Start free · Upgrade anytime for full access'}
        </p>
      </div>

      {/* Featured course — large card */}
      {featured && (
        <button
          onClick={() => navigate(`/course/${featured.id}`)}
          className="w-full dark-card p-5 sm:p-6 text-left group active:scale-[0.99] bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border-emerald-500/15"
        >
          <div className="flex items-center gap-4">
            <CourseIcon courseId={featured.id} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-full">FREE</span>
                <span className="text-[10px] font-extrabold text-white/30 bg-white/5 px-2 py-0.5 rounded-full">RECOMMENDED</span>
              </div>
              <h2 className="font-extrabold text-white text-lg group-hover:text-brand-300 transition-colors">{featured.title}</h2>
              <p className="text-sm text-white/45 mt-1">{featured.shortDescription}</p>
              <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-white/30">
                <span>{featured.totalLessons} lessons</span>
                <span>·</span>
                <span>{featured.totalSentences} sentences</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} strokeWidth={2} /> ~{featured.estimatedHours}h</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 px-3 py-1.5 rounded-full group-hover:bg-emerald-500/25 transition-colors">
                Start Free →
              </span>
            </div>
          </div>
        </button>
      )}

      {/* Other courses — grid */}
      <div>
        <h2 className="text-sm font-bold text-white/50 mb-3 uppercase tracking-wider">All Courses</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((course) => (
            <button
              key={course.id}
              onClick={() => navigate(`/course/${course.id}`)}
              className="dark-card p-4 text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3">
                <CourseIcon courseId={course.id} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors truncate">{course.title}</h3>
                    {!course.isFree && (
                      <span className="text-[9px] font-extrabold text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full shrink-0 inline-flex items-center gap-0.5">
                        <Lock size={7} strokeWidth={2.5} />
                        PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/35 mt-0.5 line-clamp-1">{course.shortDescription}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-white/25">
                    <span>{course.totalLessons} lessons</span>
                    <span>·</span>
                    <span>{course.totalSentences} sentences</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/15 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
              </div>
            </button>
          ))}

          {/* Tenses card */}
          <button
            onClick={() => navigate('/tenses')}
            className="dark-card p-4 text-left group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">T</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors">English Tenses</h3>
                  <span className="text-[9px] font-extrabold text-brand-300 bg-brand-500/15 border border-brand-500/20 px-1.5 py-0.5 rounded-full">NEW</span>
                </div>
                <p className="text-[11px] text-white/35 mt-0.5">12 Tenses · 200+ sentences</p>
              </div>
              <ArrowRight size={14} className="text-white/15 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {/* Upgrade CTA */}
      {!subscription.active && (
        <div className="dark-card p-5 text-center">
          <Sparkles size={20} className="text-brand-400 mx-auto mb-2" strokeWidth={2} />
          <p className="text-sm text-white/55 mb-3">Unlock all 5,000+ sentences across every course</p>
          <button
            onClick={() => navigate('/pricing')}
            className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl"
          >
            See Plans <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
