import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_GOALS, USER_LEVELS } from '../data/goals';
import { savePrefs, saveUser } from '../lib/progress';

const GOAL_TO_COURSE: Record<string, string> = {
  'from-zero': 'beginner',
  'daily-life': 'daily-life',
  school: 'school',
  interview: 'interview',
  corporate: 'corporate',
  business: 'business',
  travel: 'travel',
  kids: 'kids',
  improve: 'intermediate',
};

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const handleFinish = () => {
    const courseId =
      selectedLevel === 'beginner' || selectedLevel === null
        ? selectedGoal === 'school'
          ? 'school'
          : selectedGoal === 'kids'
            ? 'kids'
            : 'beginner'
        : GOAL_TO_COURSE[selectedGoal ?? 'from-zero'] ?? 'beginner';
    savePrefs({
      goal: selectedGoal ?? undefined,
      level: selectedLevel ?? undefined,
      recommendedCourseId: courseId,
    });
    saveUser({ name: 'Learner', createdAt: new Date().toISOString() });
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="min-h-[80vh] flex flex-col animate-fade-in">
      <div className="flex justify-center gap-2 py-6">
        {[0, 1].map((s) => (
          <div key={s} className={`w-2.5 h-2.5 rounded-full transition-all ${s === step ? 'w-8 bg-brand-500' : 'bg-gray-200'}`} />
        ))}
      </div>

      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <span className="text-5xl mb-4">🎯</span>
          <h1 className="text-2xl font-bold text-gray-900 text-center">Why do you want to improve English?</h1>
          <p className="text-gray-500 text-center mt-2 mb-6">Choose your goal so we can recommend the right course</p>
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
            {USER_GOALS.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoal(goal.id)}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedGoal === goal.id
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <span className="text-2xl">{goal.emoji}</span>
                <p className="text-xs font-medium text-gray-700 mt-1">{goal.label}</p>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!selectedGoal}
            className="btn-primary btn-lg mt-8 w-full max-w-sm disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <span className="text-5xl mb-4">📊</span>
          <h1 className="text-2xl font-bold text-gray-900 text-center">What is your current level?</h1>
          <p className="text-gray-500 text-center mt-2 mb-6">This helps us find the right starting point</p>
          {USER_LEVELS.map((level) => (
            <button key={level.id} onClick={() => setSelectedLevel(level.id)}
              className={`w-full p-4 rounded-xl border-2 text-left mb-3 transition-all ${selectedLevel === level.id ? 'border-brand-500 bg-brand-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
            >
              <p className="font-semibold text-gray-900">{level.label}</p>
              <p className="text-sm text-gray-500 mt-0.5">{level.description}</p>
            </button>
          ))}
          <button onClick={handleFinish} disabled={!selectedLevel}
            className="btn-primary btn-lg mt-6 w-full disabled:opacity-50"
          >
            Start Learning →
          </button>
        </div>
      )}
    </div>
  );
}
