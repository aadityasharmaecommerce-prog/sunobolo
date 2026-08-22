import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { loadCourse } from '../data/content';
import type { CourseData } from '../data/content';
import { getProgress } from '../lib/progress';
import CourseIcon from '../components/CourseIcon';
import { Check, ChevronRight, Clock, ArrowLeft } from 'lucide-react';

/* ── Loading skeleton ── */
function CourseDetailSkeleton() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="rounded-3xl dark-skeleton h-48" />
      <div className="dark-card-page p-5">
        <div className="h-4 dark-skeleton rounded w-1/3 mb-3" />
        <div className="h-2.5 dark-skeleton rounded-full" />
      </div>
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="dark-card-page p-4">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl dark-skeleton" />
              <div className="flex-1">
                <div className="h-4 dark-skeleton rounded w-2/3 mb-2" />
                <div className="h-3 dark-skeleton rounded w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CourseDetail() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    loadCourse(courseId).then((c) => {
      if (!cancelled) {
        setCourse(c);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, [courseId]);

  if (loading) return <CourseDetailSkeleton />;

  if (!course) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔍</span>
        </div>
        <h2 className="text-xl font-extrabold text-white mt-4">Course not found</h2>
        <p className="text-white/45 mt-1 text-sm">The course you are looking for does not exist.</p>
        <button onClick={() => navigate('/courses')} className="btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl mt-6">
          Browse Courses
        </button>
      </div>
    );
  }

  const progress = getProgress();
  const completedLessons = course.lessons.filter((l) => {
    if (progress.completedLessons[l.id]) return true;
    const ids = l.sentences.map((s) => s.id);
    return ids.length > 0 && ids.every((id) => progress.completedSentences[id]);
  }).length;

  const COURSE_GRADIENTS: Record<string, string> = {
    'beginner': 'from-emerald-500 to-teal-600',
    'intermediate': 'from-blue-500 to-indigo-600',
    'advanced': 'from-purple-500 to-violet-700',
    'daily-life': 'from-amber-500 to-orange-600',
    'business': 'from-sky-500 to-blue-700',
    'corporate': 'from-slate-600 to-gray-800',
    'interview': 'from-rose-500 to-pink-700',
    'kids': 'from-pink-500 to-fuchsia-600',
    'school': 'from-indigo-500 to-blue-700',
    'travel': 'from-cyan-500 to-teal-600',
  };
  const heroGradient = COURSE_GRADIENTS[courseId || ''] || 'from-brand-500 to-accent-600';

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white font-medium transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Back
      </button>

      {/* ── Course Hero ── */}
      <div className={`relative overflow-hidden rounded-3xl text-white p-5 sm:p-6 bg-gradient-to-br ${heroGradient}`}>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-6 bottom-0 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <CourseIcon courseId={course.id} size="lg" />
            <div>
              <h1 className="text-xl font-extrabold">{course.title}</h1>
              <p className="text-white/70 text-sm">{course.difficulty} · {course.totalLessons} lessons</p>
            </div>
          </div>
          <p className="text-white/80 text-sm leading-relaxed">{course.description}</p>
          <div className="flex items-center gap-4 mt-3 text-sm text-white/60">
            <span className="inline-flex items-center gap-1">{course.totalSentences} sentences</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1"><Clock size={12} strokeWidth={2} /> ~{course.estimatedHours} hours</span>
          </div>
          {course.isFree && (
            <div className="mt-3 inline-flex bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold">
              Free Course
            </div>
          )}
        </div>
      </div>

      {/* ── Progress ── */}
      <div className="dark-card-page p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-white">Your Progress</h2>
          <span className="text-sm text-white/45">{completedLessons} / {course.totalLessons} lessons</span>
        </div>
        <div className="dark-progress h-2.5">
          <div className="dark-progress-fill"
            style={{ width: `${(completedLessons / Math.max(course.totalLessons, 1)) * 100}%` }} />
        </div>
      </div>

      {/* ── Lessons ── */}
      <div>
        <h2 className="text-lg font-extrabold text-white mb-3">Lessons</h2>
        <div className="space-y-2">
          {course.lessons.map((lesson, idx) => {
            const doneCount = lesson.sentences.filter((s) => progress.completedSentences[s.id]).length;
            const isDone = progress.completedLessons[lesson.id] || (lesson.sentences.length > 0 && doneCount === lesson.sentences.length);
            return (
              <button
                key={lesson.id}
                onClick={() => navigate(`/lesson/${course.id}/${lesson.id}`)}
                className="w-full dark-card p-4 text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 ${
                    isDone
                      ? 'bg-gradient-to-br from-success-400 to-emerald-600 text-white shadow-glow-success'
                      : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                    {isDone ? <Check size={16} strokeWidth={3} /> : String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white text-sm group-hover:text-brand-300 transition-colors">
                      {lesson.title}
                    </h3>
                    <p className="text-[11px] text-white/35 mt-0.5 inline-flex items-center gap-1.5">
                      <span>{doneCount}/{lesson.sentences.length} sentences</span>
                      <span>·</span>
                      <span className="inline-flex items-center gap-0.5"><Clock size={10} strokeWidth={2} /> ~{lesson.estimatedMinutes} min</span>
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-white/20 group-hover:text-white/50 transition-colors shrink-0" strokeWidth={2} />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-8" />
    </div>
  );
}
