import type { Course, CourseProgress } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

interface CourseCardProps {
  course: Course;
  progress?: CourseProgress | null;
  locked?: boolean;
}

export function CourseCard({ course, progress, locked = false }: CourseCardProps) {
  const percent = progress?.percent ?? 0;
  return (
    <article className={`course-card course-card--${course.color} ${locked ? 'course-card--locked' : ''}`}>
      <div className="course-card__top">
        <span className="course-card__emoji" aria-hidden="true">
          {course.emoji}
        </span>
        <div className="course-card__badges">
          {course.isFree || locked ? (
            <Badge variant={locked ? 'locked' : 'free'}>{locked ? 'Locked' : 'Free'}</Badge>
          ) : (
            <Badge variant="paid">Paid</Badge>
          )}
        </div>
      </div>
      <h3 className="course-card__title">{course.title}</h3>
      <p className="course-card__tagline">{course.tagline}</p>
      <p className="course-card__meta">
        {course.lessonCount} lessons · {course.sentenceCount} sentences
      </p>
      {!locked ? (
        <ProgressBar percent={percent} size="sm" showLabel label="Course progress" />
      ) : (
        <p className="course-card__locked-hint">🔒 Unlock karke practice shuru karo</p>
      )}
      <div className="course-card__footer">
        <Button
          variant={locked ? 'primary' : 'outline'}
          size="sm"
          to={locked ? ROUTES.pricing : ROUTES.course(course.id)}
        >
          {locked ? 'Unlock Now' : percent > 0 ? 'Continue →' : 'Start →'}
        </Button>
      </div>
    </article>
  );
}
