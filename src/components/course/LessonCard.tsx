import type { Lesson, LessonProgress } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

interface LessonCardProps {
  lesson: Lesson;
  progress: LessonProgress;
  locked?: boolean;
  courseId: string;
}

export function LessonCard({ lesson, progress, locked = false, courseId }: LessonCardProps) {
  return (
    <article className={`lesson-card ${progress.isComplete ? 'lesson-card--done' : ''} ${locked ? 'lesson-card--locked' : ''}`}>
      <div className="lesson-card__main">
        <span className="lesson-card__emoji" aria-hidden="true">
          {progress.isComplete ? '✅' : locked ? '🔒' : lesson.emoji}
        </span>
        <div className="lesson-card__info">
          <div className="lesson-card__title-row">
            <h4 className="lesson-card__title">{lesson.title}</h4>
            {locked && <Badge variant="locked">Locked</Badge>}
            {!locked && progress.isComplete && <Badge variant="done">Done</Badge>}
            {!locked && !lesson.isFree && <Badge variant="paid">Paid</Badge>}
          </div>
          <p className="lesson-card__meta">
            Lesson {lesson.order} · {progress.total} sentences
          </p>
          {!locked && progress.total > 0 && (
            <ProgressBar percent={progress.percent} size="sm" />
          )}
        </div>
        <Button
          variant={progress.isComplete ? 'ghost' : locked ? 'primary' : 'secondary'}
          size="sm"
          to={locked ? ROUTES.pricing : ROUTES.lesson(courseId, lesson.id)}
        >
          {locked ? 'Unlock' : progress.isComplete ? 'Repeat' : progress.percent > 0 ? 'Continue' : 'Practice'}
        </Button>
      </div>
    </article>
  );
}
