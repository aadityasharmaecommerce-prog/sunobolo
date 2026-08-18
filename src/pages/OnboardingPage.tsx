import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Goal, UserLevel } from '@/types';
import { GOALS, LEVEL_OPTIONS, ROUTES, STORAGE_KEYS } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { recommendCourse, pathLabel } from '@/services/recommendationService';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { writeStorage } from '@/utils/storage';

const STEPS = ['Goal', 'Level', 'Your Path'];

export function OnboardingPage() {
  usePageMeta('Onboarding — SunoBolo English', 'Apna goal aur level chuno, SunoBolo aapka learning path banayega.');

  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState<Goal | null>(null);
  const [level, setLevel] = useState<UserLevel | null>(null);
  const { updateProfile } = useAuth();
  const navigate = useNavigate();

  const rec = goal && level ? recommendCourse(goal, level) : null;

  const finish = () => {
    if (!rec) return;
    updateProfile({ goal: goal ?? undefined, level: level ?? undefined, recommendedCourseId: rec.courseId });
    writeStorage(STORAGE_KEYS.onboarding, { done: true, at: new Date().toISOString() });
    navigate(ROUTES.dashboard);
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="onboarding">
      <div className="onboarding__progress">
        <ProgressBar percent={progress} size="md" showLabel label={`Step ${step + 1} of ${STEPS.length} — ${STEPS[step]}`} />
      </div>

      <div className="onboarding__card">
        {step === 0 && (
          <>
            <h2>Aap kis liye English seekhna chahte hain?</h2>
            <p>Apna main goal chuno — hum usi hisaab se course suggest karenge.</p>
            <div className="option-grid">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  className={`option-btn ${goal === g.id ? 'option-btn--selected' : ''}`}
                  onClick={() => setGoal(g.id)}
                  aria-pressed={goal === g.id}
                >
                  <span className="option-btn__emoji" aria-hidden="true">{g.emoji}</span>
                  {g.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <h2>Aapka English Level?</h2>
            <p>Darna nahi — jo sahi lage wahi chuno. Galat jawab ka koi nuksan nahi.</p>
            <div className="option-grid">
              {LEVEL_OPTIONS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  className={`option-btn ${level === l.id ? 'option-btn--selected' : ''}`}
                  onClick={() => setLevel(l.id)}
                  aria-pressed={level === l.id}
                >
                  <span className="option-btn__emoji" aria-hidden="true">{l.emoji}</span>
                  {l.label}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && rec && goal && level && (
          <div className="recommendation">
            <h2>Your Learning Path ✨</h2>
            <p>Humne aapke goal aur level ke hisaab se best course chuna hai:</p>
            <div className="recommendation__path">
              <span>{pathLabel(goal, level, rec.courseId)}</span>
            </div>
            <p className="text-muted">{rec.reason}</p>
          </div>
        )}

        <div className="onboarding__actions">
          {step > 0 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              ← Back
            </Button>
          ) : (
            <span />
          )}
          {step < 2 ? (
            <Button
              disabled={step === 0 ? !goal : !level}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue →
            </Button>
          ) : (
            <Button onClick={finish}>Start Learning →</Button>
          )}
        </div>
      </div>

      {rec && (
        <p className="demo-hint">
          (Phase 1 mock recommendation — Phase 2 mein ye server-side smart logic se banega.)
        </p>
      )}
    </div>
  );
}
