import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import type { Lesson, Sentence } from '@/types';
import { METHOD, ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useProgress } from '@/context/ProgressContext';
import { useToast } from '@/context/ToastContext';
import { lessonsService } from '@/services/lessonsService';
import { sentencesService } from '@/services/sentencesService';
import { packagesService } from '@/services/packagesService';
import { Button } from '@/components/ui/Button';
import { LockedOverlay } from '@/components/ui/LockedOverlay';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function LessonPage() {
  const { courseId = '', lessonId = '' } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { completeSentence, completeLesson, setLastLesson } = useProgress();
  const audio = useAudioPlayer();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState(0);
  const [practiced, setPracticed] = useState(0);
  const [sentenceDone, setSentenceDone] = useState(false);

  const total = sentences.length;
  const current = sentences[idx] ?? null;
  const isLast = idx === total - 1;

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
    return () => { cancelled = true; };
  }, [courseId, lessonId]);

  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingState label="Lesson load ho raha hai…" />;
  if (error || !lesson) {
    return <ErrorState title="Lesson nahi mila" message="Yeh lesson exist nahi karta." onRetry={() => window.location.reload()} />;
  }
  if (locked) {
    return (
      <div className="practice">
        <LockedOverlay title={`${lesson.title} locked hai 🔒`} message="Is lesson ko kholne ke liye course ka package chahiye." />
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

  /** Tap = 1 baar audio play (SkillShakti style) */
  const handleListen = () => {
    if (audio.playing) { audio.stop(); return; }
    if (heard >= METHOD.listenCount) return;
    audio.play(current.id, current.english, () => {
      const next = heard + 1;
      setHeard(next);
      if (next >= METHOD.listenCount && practiced >= METHOD.speakCount) markDone();
    });
  };

  /** User says "bolo" — manual counter (no mic needed) */
  const handlePractice = () => {
    if (practiced >= METHOD.speakCount) return;
    const next = practiced + 1;
    setPracticed(next);
    if (heard >= METHOD.listenCount && next >= METHOD.speakCount) markDone();
  };

  const markDone = () => {
    if (sentenceDone) return;
    setSentenceDone(true);
    completeSentence(current.id, lessonId, 0.5);
    setLastLesson(courseId, lessonId, Math.min(idx + 1, total - 1));
  };

  const goNext = () => {
    audio.stop();
    if (isLast) {
      completeLesson(lessonId);
      toast(`🎉 ${lesson.title} complete! Bahut badhiya!`);
      navigate(ROUTES.course(courseId));
      return;
    }
    setIdx((i) => i + 1);
    setHeard(0);
    setPracticed(0);
    setSentenceDone(false);
    setLastLesson(courseId, lessonId, idx + 1);
  };

  const progressPct = total > 0 ? ((idx + (sentenceDone ? 1 : 0)) / total) * 100 : 0;

  return (
    <div className="practice practice--skillshakti">
      {/* ─── Top bar: lesson title + back link ─── */}
      <div className="practice__topbar">
        <Link to={ROUTES.course(courseId)} className="practice__back">
          ← {lesson.emoji} {lesson.title}
        </Link>
        <span className="practice__count-badge">
          {idx + 1} of {total}
        </span>
      </div>

      {/* ─── Progress bar ─── */}
      <div className="practice__progress-bar">
        <div className="practice__progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {/* ─── Sentence card (SkillShakti style) ─── */}
      <div className="shakti-card">
        <p className="shakti-card__topic">{lesson.title}</p>
        <span className="shakti-card__num">#{idx + 1}</span>

        <div className="shakti-card__sentence">
          <span className="shakti-card__label">🔤 English Sentence</span>
          <p className="shakti-card__english">{current.english}</p>
        </div>

        <div className="shakti-card__hindi-box">
          <span className="shakti-card__label">🇮🇳 Hindi Meaning</span>
          <p className="shakti-card__hindi">{current.hindi}</p>
        </div>

        {/* Audio button */}
        <div className="shakti-card__audio">
          <span className="shakti-card__label">🔊 Audio Practice</span>
          <button
            type="button"
            className={`shakti-play-btn ${audio.playing ? 'shakti-play-btn--active' : ''}`}
            onClick={handleListen}
            disabled={heard >= METHOD.listenCount}
            aria-label={audio.playing ? 'Audio ruko' : `Sunne ke liye play karein`}
          >
            {audio.playing ? '⏹' : '▶️'} {heard >= METHOD.listenCount ? 'Suno Dobara' : 'Sunne ke liye play karein'}
          </button>
          <p className="shakti-hint">ज़ोर से 3 बार बोलें — muscle memory बनती है</p>
        </div>

        {/* Listen counter */}
        <div className="shakti-counter">
          <span className="shakti-counter__label">🔊 Suno</span>
          <div className="shakti-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`shakti-dot ${heard >= n ? 'shakti-dot--done' : heard === n - 1 && audio.playing ? 'shakti-dot--active' : ''}`}>
                {heard >= n ? '✓' : n}
              </span>
            ))}
          </div>
          <span className="shakti-counter__status">
            {heard >= METHOD.listenCount ? '✅ Sun liya!' : `Suno ${heard} / ${METHOD.listenCount}`}
          </span>
        </div>

        {/* Speak counter */}
        <div className="shakti-counter">
          <span className="shakti-counter__label">🎤 Bolo</span>
          <div className="shakti-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`shakti-dot ${practiced >= n ? 'shakti-dot--done' : ''}`}>
                {practiced >= n ? '✓' : n}
              </span>
            ))}
          </div>
          <span className="shakti-counter__status">
            {practiced >= METHOD.speakCount ? '✅ Bola!' : `Bolo ${practiced} / ${METHOD.speakCount}`}
          </span>
          <button
            type="button"
            className="shakti-bolo-btn"
            onClick={handlePractice}
            disabled={practiced >= METHOD.speakCount || sentenceDone}
          >
            🎤 {practiced === 0 ? 'Ab boliye — 3 baar' : practiced >= METHOD.speakCount ? '3 baar ho gaya!' : 'Aur 1 baar bolo'}
          </button>
        </div>
      </div>

      {/* ─── Completion / Next ─── */}
      {sentenceDone ? (
        <div className="shakti-done">
          <span className="shakti-done__emoji" aria-hidden="true">✅</span>
          <h2>Great! Sentence complete!</h2>
          <p>{isLast ? 'Yeh lesson ka aakhri sentence tha!' : 'Agla sentence par chalo.'}</p>
          <Button size="lg" onClick={goNext}>
            {isLast ? '🎉 Finish Lesson' : 'NEXT SENTENCE →'}
          </Button>
        </div>
      ) : (
        <div className="shakti-footer">
          <Button variant="outline" fullWidth onClick={goNext}>
            SKIP →
          </Button>
        </div>
      )}
    </div>
  );
}
