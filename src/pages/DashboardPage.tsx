import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import type { Course, Lesson } from '@/types';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { coursesService } from '@/services/coursesService';
import { lessonsService } from '@/services/lessonsService';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatCard } from '@/components/ui/StatCard';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { formatMinutes } from '@/utils/dates';

const DASH_COURSE_IDS = ['daily', 'beginner', 'intermediate', 'advanced', 'interview', 'corporate', 'business', 'travel'];

export function DashboardPage() {
  usePageMeta('Dashboard — SunoBolo English', 'Apni practice progress dekho aur continue karo.');

  const { user, isAuthenticated } = useAuth();
  const { stats, getCourseProgress, progress } = useProgress();
  const [courses, setCourses] = useState<Course[]>([]);
  const [continueLesson, setContinueLesson] = useState<Lesson | null>(null);
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await coursesService.getCourses();
        if (cancelled) return;
        setCourses(all.filter((c) => DASH_COURSE_IDS.includes(c.id)));

        // Resolve "continue learning" from lastLesson, else the recommended course.
        const last = progress.lastLesson;
        if (last) {
          const [lesson, course] = await Promise.all([
            lessonsService.getLesson(last.lessonId),
            coursesService.getCourse(last.courseId),
          ]);
          if (!cancelled) {
            setContinueLesson(lesson);
            setContinueCourse(course);
          }
        } else if (user?.recommendedCourseId) {
          const course = await coursesService.getCourse(user.recommendedCourseId);
          if (!cancelled) setContinueCourse(course);
        } else {
          const course = await coursesService.getCourse('beginner');
          if (!cancelled) setContinueCourse(course);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.lastLesson?.lessonId, user?.recommendedCourseId]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.onboarding} replace />;
  }

  const continuePercent = continueLesson ? getCourseProgress(continueCourse?.id ?? '').percent : 0;

  return (
    <div className="dashboard container">
      <div className="dashboard__welcome">
        <h1>Namaste, {user?.name?.split(' ')[0] ?? 'Dost'}! 👋</h1>
        <p>Roz 10–15 minute practice karo — English bolna aasaan hai.</p>
      </div>

      {/* Continue Learning */}
      {continueCourse && (
        <section className="continue-card mb-2">
          <span className="continue-card__title">Continue Learning</span>
          <h2>{continueCourse.emoji} {continueCourse.title}</h2>
          <p className="text-muted">
            {continueLesson ? `Lesson ${continueLesson.order}: ${continueLesson.title}` : 'Shuruaat karein'}
          </p>
          <ProgressBar percent={continuePercent} size="md" showLabel label="Course progress" />
          <div>
            <Button
              size="lg"
              onClick={() =>
                continueLesson
                  ? navigate(ROUTES.lesson(continueCourse.id, continueLesson.id))
                  : navigate(ROUTES.course(continueCourse.id))
              }
            >
              CONTINUE →
            </Button>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="stats-grid mt-4 mb-2">
        <StatCard emoji="🗣️" label="Sentences practiced" value={stats.sentencesPracticed} hint="Practice se hi improvement" />
        <StatCard emoji="✅" label="Lessons completed" value={stats.lessonsCompleted} />
        <StatCard emoji="🔥" label="Current streak" value={`${stats.currentStreak} days`} hint="Roz practice karo, streak badhegi" />
        <StatCard emoji="📈" label="Overall progress" value={`${stats.overallPercent}%`} hint={`${formatMinutes(stats.totalMinutes)} total practice`} />
      </section>

      {/* Course grid */}
      <section className="mt-4">
        <div className="flex-between mb-2">
          <h2 className="fs-title">Aapke courses</h2>
          <Button variant="ghost" size="sm" to={ROUTES.courses}>
            View all →
          </Button>
        </div>
        {loading ? (
          <LoadingState label="Courses load ho rahe hain…" />
        ) : error ? (
          <ErrorState onRetry={() => window.location.reload()} />
        ) : (
          <div className="dash-courses">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} progress={getCourseProgress(course.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
