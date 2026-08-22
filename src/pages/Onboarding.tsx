import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USER_GOALS, USER_LEVELS } from '../data/goals';
import { savePrefs, saveUser } from '../lib/progress';
import {
  Sparkles, MessageCircle, GraduationCap, Briefcase, Building2,
  TrendingUp, Plane, Baby, BarChart3, ArrowRight, Target, BarChart
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  'sparkles': Sparkles,
  'message-circle': MessageCircle,
  'graduation-cap': GraduationCap,
  'briefcase': Briefcase,
  'building-2': Building2,
  'trending-up': TrendingUp,
  'plane': Plane,
  'baby': Baby,
  'bar-chart-3': BarChart3,
};

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
      {/* Progress dots */}
      <div className="flex justify-center gap-2 py-6">
        {[0, 1].map((s) => (
          <div key={s} className={`h-2.5 rounded-full transition-all ${s === step ? 'w-8 bg-brand-500' : 'w-2.5 bg-white/15'}`} />
        ))}
      </div>

      {/* Step 1: Goal */}
      {step === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center mb-4">
            <Target size={24} className="text-brand-400" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center">Why do you want to improve English?</h1>
          <p className="text-white/45 text-center mt-2 mb-6 text-sm">Choose your goal so we can recommend the right course</p>
          <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
            {USER_GOALS.map((goal) => {
              const Icon = ICON_MAP[goal.iconId] || Sparkles;
              return (
                <button
                  key={goal.id}
                  onClick={() => setSelectedGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedGoal === goal.id
                      ? 'border-brand-500 bg-brand-500/15'
                      : 'border-white/10 bg-white/5 hover:border-white/20'
                  }`}
                >
                  <Icon size={22} className={selectedGoal === goal.id ? 'text-brand-400' : 'text-white/35'} strokeWidth={2} />
                  <p className="text-xs font-semibold text-white/70 mt-2">{goal.label}</p>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setStep(1)}
            disabled={!selectedGoal}
            className="btn-premium btn-premium-gradient mt-8 w-full max-w-sm py-3.5 text-sm rounded-xl disabled:opacity-50"
          >
            Next <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* Step 2: Level */}
      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-accent-500/15 border border-accent-500/25 flex items-center justify-center mb-4">
            <BarChart size={24} className="text-accent-400" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-extrabold text-white text-center">What is your current level?</h1>
          <p className="text-white/45 text-center mt-2 mb-6 text-sm">This helps us find the right starting point</p>
          {USER_LEVELS.map((level) => (
            <button key={level.id} onClick={() => setSelectedLevel(level.id)}
              className={`w-full p-4 rounded-xl border-2 text-left mb-3 transition-all ${selectedLevel === level.id ? 'border-brand-500 bg-brand-500/15' : 'border-white/10 bg-white/5 hover:border-white/20'}`}
            >
              <p className="font-bold text-white">{level.label}</p>
              <p className="text-sm text-white/45 mt-0.5">{level.description}</p>
            </button>
          ))}
          <button onClick={handleFinish} disabled={!selectedLevel}
            className="btn-premium btn-premium-gradient mt-6 w-full py-3.5 text-sm rounded-xl disabled:opacity-50">
            Start Learning <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      )}
    </div>
  );
}
