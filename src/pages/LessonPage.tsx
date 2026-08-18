import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Lesson, Sentence } from '@/types';
import { METHOD, ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useSpeech } from '@/hooks/useSpeech';
import { useProgress } from '@/context/ProgressContext';
import { useToast } from '@/context/ToastContext';
import { lessonsService } from '@/services/lessonsService';
import { sentencesService } from '@/services/sentencesService';
import { packagesService } from '@/services/packagesService';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { LockedOverlay } from '@/components/ui/LockedOverlay';
import { LoadingState, ErrorState } from '@/components/ui/States';

const DIFFICULTY_LABEL: Record<Sentence['difficulty'], string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

function RepDots({ total, done, activeIndex }: { total: number; done: number; activeIndex: number | null }) {
  return (
    <div className="rep-dots" aria-label={`${done} of ${total} done`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`rep-dot ${i < done ? 'rep-dot--done' : activeIndex === i ? 'rep-dot--active' : ''}`}
          aria-hidden="true"
        >
          {i < done ? '✓' : i + 1}
        </span>
      ))}
    </div>
  );
}

export function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeSentence, completeLesson, setLastLesson, getLessonProgress } = useProgress();
  const tts = useSpeech();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState(0);
  const [practiced, setPracticed] = useState(0);
  const [listening, setListening] = useState(false);
  const [sentenceDone, setSentenceDone] = useState(false);
  const practiceTimer = useRef<number | null>(null);

  // Refs mirror state so async callbacks (TTS onend, practice timer) never read stale values.
  const heardRef = useRef(0);
  const practicedRef = useRef(0);
  const doneRef = useRef(false);
  heardRef.current = heard;
  practicedRef.current = practiced;
  doneRef.current = sentenceDone;

  const total = sentences.length;
  const current = sentences[idx] ?? null;
  const isLast = idx === total - 1;
  const lessonProgress = getLessonProgress(lessonId);

  usePageMeta(
    lesson ? `${lesson.title} — Practice — SunoBolo English` : 'Practice — SunoBolo English',
    'Sentence ko 3 baar suno, 3 baar bolo, phir next — SunoBolo practice.',
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const [l, ss, isUnlocked] = await Promise.all([
          lessonsService.getLesson(lessonId),
          sentencesService.getSentences(lessonId),
          packagesService.isCourseUnlocked(courseId),
        ]);
        if (cancelled) return;
        setLesson(l);
        setSentences(ss);
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
  }, [courseId, lessonId]);

  // Stop any speech on unmount.
  useEffect(() => () => tts.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingState label="Lesson load ho raha hai…" />;
  if (error || !lesson) {
    return <ErrorState title="Lesson nahi mila" message="Yeh lesson exist nahi karta." onRetry={() => window.location.reload()} />;
  }
  if (locked) {
    return (
      <div className="practice">
        <LockedOverlay
          title={`${lesson.title} locked hai 🔒`}
          message="Is lesson ko kholne ke liye course ka package chahiye. Pricing page se unlock karo."
        />
        <Button variant="ghost" to={ROUTES.course(courseId)}>← Back to course</Button>
      </div>
    );
  }
  if (total === 0 || !current) {
    return (
      <div className="practice">
        <div className="state">
          <span className="state__emoji" aria-hidden="true">📭</span>
          <h3>Is lesson mein abhi sentences nahi hain</h3>
          <Button variant="outline" to={ROUTES.course(courseId)}>Back to course</Button>
        </div>
      </div>
    );
  }

  const markDone = () => {
    if (doneRef.current) return;
    setSentenceDone(true);
    completeSentence(current.id, lessonId, 0.5);
    setLastLesson(courseId, lessonId, Math.min(idx + 1, total - 1));
  };

  const handleListen = () => {
    if (tts.speaking) {
      tts.stop();
      return;
    }
    if (!tts.supported) {
      // No voice available: manual fallback — each click counts as one "heard".
      const next = Math.min(METHOD.listenCount, heardRef.current + 1);
      setHeard(next);
      if (next === METHOD.listenCount && practicedRef.current >= METHOD.speakCount) markDone();
      return;
    }
    setHeard(0);
    tts.speakRepeated(current.english, METHOD.listenCount, {
      onProgress: (done) => {
        setHeard(done);
        if (done >= METHOD.listenCount && practicedRef.current >= METHOD.speakCount) markDone();
      },
    });
  };

  const handlePractice = () => {
    if (listening) return;
    if (tts.speaking) tts.stop();
    setListening(true);
    practiceTimer.current = window.setTimeout(() => {
      setListening(false);
      const next = Math.min(METHOD.speakCount, practicedRef.current + 1);
      setPracticed(next);
      if (next === METHOD.speakCount && heardRef.current >= METHOD.listenCount) markDone();
    }, METHOD.practiceHoldMs);
  };

  const goNext = () => {
    if (practiceTimer.current) window.clearTimeout(practiceTimer.current);
    if (isLast) {
      // Lesson finished 🎉
      completeLesson(lessonId);
      toast(`🎉 ${lesson.title} complete! Bahut badhiya!`);
      navigate(ROUTES.course(courseId));
      return;
    }
    tts.stop();
    setIdx((i) => i + 1);
    setHeard(0);
    setPracticed(0);
    setSentenceDone(false);
    setListening(false);
    setLastLesson(courseId, lessonId, idx + 1);
  };

  return (
    <div className="practice">
      <div className="practice__top">
        <div className="practice__heading">
          <div>
            <Link to={ROUTES.course(courseId)} className="text-muted" style={{ fontSize: 'var(--fs-sm)' }}>
              ← {lesson.emoji} {lesson.title}
            </Link>
            <h1 className="mt-1">{lesson.title}</h1>
          </div>
          <span className="practice__sentence-num">
            Sentence {idx + 1} of {total}
          </span>
        </div>
        <ProgressBar percent={((idx + (sentenceDone ? 1 : 0)) / total) * 100} size="sm" showLabel label="Lesson progress" />
      </div>

      {/* Sentence */}
      <div className="sentence-card">
        <p className="sentence-card__english">{current.english}</p>
        <p className="sentence-card__hindi">{current.hindi}</p>
        <div className="sentence-card__meta">
          <Badge variant="info">{DIFFICULTY_LABEL[current.difficulty]}</Badge>
          {lessonProgress.percent > 0 && <Badge variant="done">{lessonProgress.percent}% done</Badge>}
        </div>
      </div>

      {/* Listen panel */}
      <div className="practice-panel practice-panel--listen">
        <span className="practice-panel__label">🔊 Suno aur Bolo — 3 baar suno</span>
        <RepDots total={METHOD.listenCount} done={heard} activeIndex={tts.speaking ? heard : null} />
        <Button size="lg" fullWidth onClick={handleListen} disabled={sentenceDone}>
          {tts.speaking ? '⏹ Stop' : heard >= METHOD.listenCount ? '🔁 Suno Dobara' : '🔊 SUNO AUR BOLO'}
        </Button>
        {!tts.supported && (
          <p className="practice-hint">⚠️ Aapke browser mein voice support nahi hai — sentence khud padhein, har click par 1 count hota hai.</p>
        )}
        {tts.supported && heard >= METHOD.listenCount && (
          <p className="practice-hint">Heard {heard} / {METHOD.listenCount} ✅ Ab aapki baari!</p>
        )}
      </div>

      {/* Speak panel */}
      <div className="practice-panel practice-panel--speak">
        <span className="practice-panel__label">🎤 Ab aap boliye — 3 baar</span>
        <RepDots total={METHOD.speakCount} done={practiced} activeIndex={listening ? practiced : null} />
        <p className="practice-hint">
          Practice {Math.min(practiced + (listening ? 1 : 0), METHOD.speakCount)} / {METHOD.speakCount}
        </p>
        <button
          type="button"
          className={`mic-btn ${listening ? 'mic-btn--listening' : ''}`}
          onClick={handlePractice}
          disabled={sentenceDone}
          aria-label={listening ? 'Listening…' : 'Start speaking practice'}
        >
          {listening ? '🎙️' : '🎤'}
        </button>
        <p className="practice-hint">
          {listening
            ? 'Sun rahe hain… sentence bolo!'
            : practiced >= METHOD.speakCount
              ? '3 baar ho gaya! Shabash! 🎉'
              : 'START dabao aur sentence 1 baar bolo'}
        </p>
      </div>

      {/* Completion / next */}
      {sentenceDone ? (
        <div className="completion">
          <span className="completion__emoji" aria-hidden="true">✅</span>
          <h2>Great! Sentence complete!</h2>
          <p>You completed this sentence. {isLast ? 'Yeh lesson ka aakhri sentence tha!' : 'Agla sentence par chalo.'}</p>
          <div className="mt-3">
            <Button size="lg" onClick={goNext}>
              {isLast ? '🎉 Finish Lesson' : 'NEXT SENTENCE →'}
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="outline" fullWidth onClick={goNext}>
          NEXT →
        </Button>
      )}
    </div>
  );
}
