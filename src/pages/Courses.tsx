import { useNavigate } from 'react-router-dom';
import { courseMetadata } from '../data/content';
import { useAuth } from '../lib/auth';
import CourseIcon from '../components/CourseIcon';
import { Lock, Clock, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';

export default function Courses() {
  const navigate = useNavigate();
  const { subscription } = useAuth();

  const featured = courseMetadata.find(c => c.id === 'beginner');
  const rest = courseMetadata.filter(c => c.id !== 'beginner');

  return (
    <div className="space-y-8 animate-fade-in min-h-[50vh]">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white font-medium transition-colors">
        <ArrowLeft size={16} strokeWidth={2.5} /> Back
      </button>

      <div className="text-center pt-2">
        <p className="dark-kicker">Choose a course</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Choose Your English Journey</h1>
        <p className="text-white/35 text-sm mt-1.5 max-w-md mx-auto">
          {subscription.active ? 'Full access active — all courses unlocked' : '25 free sentences · Upgrade for full access'}
        </p>
      </div>

      {/* Featured course */}
      {featured && (
        <button onClick={() => navigate(`/course/${featured.id}`)}
          className="w-full dark-card p-6 text-left group active:scale-[0.99] bg-gradient-to-br from-emerald-500/8 to-teal-500/4 border-emerald-500/10">
          <div className="flex items-center gap-5">
            <CourseIcon courseId={featured.id} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                {!featured.isFree && !subscription.active && (
                  <span className="text-[10px] font-extrabold text-brand-300 bg-brand-500/12 px-2 py-0.5 rounded-full">PREMIUM</span>
                )}
                {!featured.isFree && subscription.active && (
                  <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/12 px-2 py-0.5 rounded-full">ACTIVE</span>
                )}
                <span className="text-[10px] font-extrabold text-white/25 bg-white/5 px-2 py-0.5 rounded-full">RECOMMENDED</span>
              </div>
              <h2 className="font-extrabold text-white text-lg group-hover:text-brand-300 transition-colors">{featured.title}</h2>
              <p className="text-sm text-white/40 mt-1">{featured.shortDescription}</p>
              <div className="flex items-center gap-4 mt-3 text-xs font-semibold text-white/25">
                <span>{featured.totalLessons} lessons</span>
                <span className="text-white/10">·</span>
                <span>{featured.totalSentences} sentences</span>
                <span className="text-white/10">·</span>
                <span className="inline-flex items-center gap-1"><Clock size={12} strokeWidth={2} /> ~{featured.estimatedHours}h</span>
              </div>
            </div>
            <span className={`text-xs font-bold px-4 py-2 rounded-full transition-colors shrink-0 ${
              featured.isFree
                ? 'text-emerald-300 bg-emerald-500/12 group-hover:bg-emerald-500/20'
                : subscription.active
                  ? 'text-emerald-300 bg-emerald-500/12 group-hover:bg-emerald-500/20'
                  : 'text-brand-300 bg-brand-500/12 group-hover:bg-brand-500/20'
            }`}>
              {featured.isFree ? 'Start Free →' : subscription.active ? 'Continue →' : 'Unlock Course →'}
            </span>
          </div>
        </button>
      )}

      {/* Other courses */}
      <div>
        <h2 className="text-xs font-bold text-white/40 mb-3 uppercase tracking-wider">All Courses</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {rest.map((course) => (
            <button key={course.id} onClick={() => navigate(`/course/${course.id}`)}
              className="dark-card p-4 text-left group active:scale-[0.99]">
              <div className="flex items-center gap-3">
                <CourseIcon courseId={course.id} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors truncate">{course.title}</h3>
                    {!course.isFree && (
                      <span className="text-[9px] font-extrabold text-white/25 bg-white/5 px-1.5 py-0.5 rounded-full shrink-0 inline-flex items-center gap-0.5">
                        <Lock size={7} strokeWidth={2.5} /> PRO
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/30 mt-0.5 line-clamp-1">{course.shortDescription}</p>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] font-semibold text-white/20">
                    <span>{course.totalLessons} lessons</span>
                    <span>·</span>
                    <span>{course.totalSentences} sentences</span>
                  </div>
                </div>
                <ArrowRight size={14} className="text-white/10 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
              </div>
            </button>
          ))}

          <button onClick={() => navigate('/tenses')}
            className="dark-card p-4 text-left group active:scale-[0.99]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C4DFF] to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0 shadow-[0_4px_12px_-4px_rgba(108,77,255,0.3)]">T</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm group-hover:text-brand-300 transition-colors">English Tenses</h3>
                  <span className="text-[9px] font-extrabold text-brand-300 bg-[#6C4DFF]/12 px-1.5 py-0.5 rounded-full">NEW</span>
                </div>
                <p className="text-[11px] text-white/30 mt-0.5">12 Tenses · 200+ sentences</p>
              </div>
              <ArrowRight size={14} className="text-white/10 group-hover:text-brand-400 transition-colors shrink-0" strokeWidth={2} />
            </div>
          </button>
        </div>
      </div>

      {!subscription.active && (
        <div className="dark-card p-6 text-center">
          <Sparkles size={22} className="text-brand-400 mx-auto mb-2" strokeWidth={2} />
          <p className="text-sm text-white/50 mb-3">Unlock all 5,000+ sentences across every course</p>
          <button onClick={() => navigate('/pricing')}
            className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl">
            See Plans <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
