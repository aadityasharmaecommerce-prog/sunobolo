import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { Sentence } from '@/types';
import { freeTrialSentences } from '@/data/seed/free-trial';
import { ROUTES } from '@/constants';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Button } from '@/components/ui/Button';



/** First 25 curated free trial sentences. */
function getTrialSentences(): Sentence[] {
  return freeTrialSentences.map((s, i) => ({
    id: 'trial-' + (i + 1),
    lessonId: 'trial',
    courseId: 'trial',
    english: s.english,
    hindi: s.hindi,
    difficulty: s.difficulty,
    order: i + 1,
    isFree: true,
  }));
}
export function FreeTrialPage() {
  const audio = useAudioPlayer();
  const trial = useMemo(() => getTrialSentences(), []);
  const [idx, setIdx] = useState(0);
  const [heard, setHeard] = useState(0);
  const [practiced, setPracticed] = useState(0);
  const [sentenceDone, setSentenceDone] = useState(false);
  const [completed, setCompleted] = useState(false);

  const current = trial[idx] ?? null;
  const isLast = idx >= trial.length - 1;
  const total = trial.length;
  const progressPct = total > 0 ? ((idx + (sentenceDone ? 1 : 0)) / total) * 100 : 0;

  useEffect(() => () => audio.stop(), []); // eslint-disable-line react-hooks/exhaustive-deps

  if (trial.length === 0) {
    return (
      <div className="trial-page">
        <div className="state">
          <span className="state__emoji">📭</span>
          <h3>Trial sentences load nahi ho paye</h3>
          <Button to={ROUTES.home}>Home</Button>
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="trial-page">
        <div className="trial-completion">
          <span className="trial-completion__emoji" aria-hidden="true">🎉</span>
          <h1>25 Sentences Complete!</h1>
          <p className="trial-completion__sub">
            Aapne English ko sun kar aur bol kar practice ki. Ab apni learning journey continue karein.
          </p>
          <div className="trial-completion__list">
            <p>✅ Beginner English — Start from zero</p>
            <p>✅ Intermediate English — Build conversation skills</p>
            <p>✅ Advanced English — Professional communication</p>
            <p>✅ Daily Life English — Real-life conversations</p>
            <p>✅ Interview English — Interview speaking practice</p>
            <p>✅ Corporate English — Office & professional English</p>
          </div>
          <div className="trial-completion__cta">
            <Button size="lg" to={ROUTES.onboarding}>🚀 CONTINUE LEARNING</Button>
            <p className="trial-completion__note">25 free sentences ke baad full course unlock karein.</p>
          </div>
        </div>
      </div>
    );
  }

  /** Audio: tap = 1 play, 3 total */
  const handleListen = () => {
    if (audio.playing) { audio.stop(); return; }
    if (heard >= 3) return;
    audio.play(current.id, current.english, () => {
      const next = heard + 1;
      setHeard(next);
      if (next >= 3 && practiced >= 3) markDone();
    });
  };

  /** User says bolo — manual counter */
  const handlePractice = () => {
    if (practiced >= 3) return;
    const next = practiced + 1;
    setPracticed(next);
    if (heard >= 3 && next >= 3) markDone();
  };

  const markDone = () => {
    if (sentenceDone) return;
    setSentenceDone(true);
  };

  const goNext = () => {
    audio.stop();
    if (isLast) {
      setCompleted(true);
      return;
    }
    setIdx((i) => i + 1);
    setHeard(0);
    setPracticed(0);
    setSentenceDone(false);
  };

  return (
    <div className="trial-page">
      {/* Top bar */}
      <div className="trial-top">
        <div className="trial-top__left">
          <Link to={ROUTES.home} className="trial-back">← Home</Link>
          <span className="trial-badge">Free Practice</span>
        </div>
        <span className="trial-counter">{idx + 1} / {total}</span>
      </div>

      {/* Progress */}
      <div className="trial-progress">
        <div className="trial-progress__fill" style={{ width: progressPct + '%' }} />
      </div>

      {/* Sentence card */}
      <div className="trial-card">
        <span className="trial-card__num">#{idx + 1}</span>

        <div className="trial-card__sentence">
          <span className="trial-card__label">🔤 English Sentence</span>
          <p className="trial-card__english">{current.english}</p>
        </div>

        <div className="trial-card__hindi-box">
          <span className="trial-card__label">🇮🇳 Hindi Meaning</span>
          <p className="trial-card__hindi">{current.hindi}</p>
        </div>

        {/* Audio */}
        <div className="trial-card__audio">
          <span className="trial-card__label">🔊 Audio Practice</span>
          <button
            type="button"
            className={'trial-play-btn' + (audio.playing ? ' trial-play-btn--active' : '')}
            onClick={handleListen}
            disabled={heard >= 3}
          >
            {audio.playing ? '⏹ Ruko' : '▶️'} {heard >= 3 ? 'Suno Dobara' : 'Sunne ke liye play karein'}
          </button>
          <p className="trial-hint">ज़ोर से 3 बार बोलें — muscle memory बनती है</p>
        </div>

        {/* Listen counter */}
        <div className="trial-counter-section">
          <span className="trial-counter-label">🔊 Suno</span>
          <div className="trial-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={'trial-dot' + (heard >= n ? ' trial-dot--done' : '')}>
                {heard >= n ? '✓' : n}
              </span>
            ))}
          </div>
          <span className="trial-counter-status">
            {heard >= 3 ? '✅ Sun liya!' : 'Suno ' + heard + ' / 3'}
          </span>
        </div>

        {/* Speak counter */}
        <div className="trial-counter-section">
          <span className="trial-counter-label">🎤 Bolo</span>
          <div className="trial-dots">
            {[1, 2, 3].map((n) => (
              <span key={n} className={'trial-dot' + (practiced >= n ? ' trial-dot--done' : '')}>
                {practiced >= n ? '✓' : n}
              </span>
            ))}
          </div>
          <span className="trial-counter-status">
            {practiced >= 3 ? '✅ Bola!' : 'Bolo ' + practiced + ' / 3'}
          </span>
          <button
            type="button"
            className="trial-bolo-btn"
            onClick={handlePractice}
            disabled={practiced >= 3 || sentenceDone}
          >
            🎤 {practiced === 0 ? 'Ab boliye — 3 baar' : practiced >= 3 ? '3 baar ho gaya!' : 'Aur 1 baar bolo'}
          </button>
        </div>
      </div>

      {/* Completion / Next */}
      {sentenceDone ? (
        <div className="trial-done">
          <span className="trial-done__emoji" aria-hidden="true">✅</span>
          <h2>Great! Sentence complete!</h2>
          <Button size="lg" onClick={goNext}>
            {isLast ? '🎉 Finish Trial' : 'NEXT SENTENCE →'}
          </Button>
        </div>
      ) : (
        <div className="trial-footer">
          <Button variant="outline" fullWidth onClick={goNext}>SKIP →</Button>
        </div>
      )}
    </div>
  );
}
