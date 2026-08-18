import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Course, Lesson } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProgress } from '@/context/ProgressContext';
import { coursesService } from '@/services/coursesService';
import { lessonsService } from '@/services/lessonsService';
import { packagesService } from '@/services/packagesService';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { LessonCard } from '@/components/course/LessonCard';
import { LockedOverlay } from '@/components/ui/LockedOverlay';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

export function CoursePage() {
  const { courseId = '' } = useParams();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getCourseProgress, getLessonProgress } = useProgress();

  usePageMeta(
    course ? `${course.title} — SunoBolo English` : 'Course — SunoBolo English',
    course?.description,
    course?.slug,
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [c, ls, isUnlocked] = await Promise.all([
          coursesService.getCourse(courseId),
          lessonsService.getLessons(courseId),
          packagesService.isCourseUnlocked(courseId),
        ]);
        if (cancelled) return;
        setCourse(c);
        setLessons(ls);
        setLocked(!isUnlocked);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [courseId]);

  if (loading) return <LoadingState label="Course load ho raha hai…" />;
  if (error || !course) {
    return <ErrorState title="Course nahi mila" message="Yeh course exist nahi karta ya load nahi ho paya." onRetry={() => window.location.reload()} />;
  }

  const progress = getCourseProgress(course.id);

  return (
    <div>
      <section className="course-hero">
        <div className="container course-hero__inner">
          <span className="course-hero__emoji" aria-hidden="true">{course.emoji}</span>
          <div style={{ flex: 1 }}>
            <div className="flex" style={{ gap: 8, marginBottom: 8 }}>
              {course.isFree ? <Badge variant="free">Free</Badge> : <Badge variant="paid">Paid</Badge>}
              <Badge variant="info">{course.lessonCount} lessons</Badge>
              <Badge variant="neutral">{course.sentenceCount} sentences</Badge>
            </div>
            <h1>{course.title}</h1>
            <p className="course-hero__tagline" style={{ color: 'var(--text-3)', fontWeight: 600 }}>
              {course.tagline}
            </p>
            <p className="course-hero__desc mt-1">{course.longDescription}</p>
          </div>
          <div style={{ minWidth: 200, flex: '0 1 260px' }}>
            <ProgressBar percent={progress.percent} size="lg" showLabel label="Progress" />
            <p className="mt-2 text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
              {progress.completedSentences} / {progress.totalSentences} sentences done
            </p>
          </div>
        </div>
      </section>

      <section className="container section">
        {locked ? (
          <LockedOverlay
            title={`${course.title} locked hai 🔒`}
            message="Is course ko kholne ke liye ek package chahiye. FREE plan mein Kids, School aur Beginner courses hain — wahan se shuru karo!"
          />
        ) : (
          <div className="lessons-list">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                courseId={course.id}
                progress={getLessonProgress(lesson.id)}
              />
            ))}
            {lessons.length === 0 && (
              <p className="text-muted text-center">Is course mein abhi lessons nahi hain.</p>
            )}
          </div>
        )}
        <div className="mt-4 text-center">
          <Button variant="ghost" to={ROUTES.courses}>
            ← All courses
          </Button>
        </div>
      </section>
    </div>
  );
}
