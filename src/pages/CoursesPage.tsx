import { useEffect, useState } from 'react';
import type { Course } from '@/types';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProgress } from '@/context/ProgressContext';
import { coursesService } from '@/services/coursesService';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function CoursesPage() {
  usePageMeta(
    'All Courses — SunoBolo English',
    'Kids, School, Beginner, Intermediate, Advanced, Daily, Interview, Corporate, Business aur Travel — sab English courses ek jagah.',
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getCourseProgress } = useProgress();

  useEffect(() => {
    let cancelled = false;
    coursesService
      .getCourses()
      .then((data) => !cancelled && setCourses(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container section">
      <div className="section__head">
        <p className="eyebrow">Courses</p>
        <h1 className="section__title">Sab courses — ek jagah</h1>
        <p className="section__subtitle">Suno. Bolo. Repeat Karo. — har course isi simple method par chalta hai.</p>
      </div>
      {loading ? (
        <LoadingState label="Courses load ho rahe hain…" />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <div className="grid grid-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} progress={getCourseProgress(course.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
