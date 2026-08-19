import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPrefs, getUser, savePrefs, saveUser } from '../lib/progress';

export default function Profile() {
  const navigate = useNavigate();
  const stored = getUser();
  const prefs = getPrefs();
  const [name, setName] = useState(stored?.name ?? '');
  const [autoPlay, setAutoPlay] = useState(prefs.autoPlay !== false);
  const [saved, setSaved] = useState(false);

  const isGuest = !stored;

  const saveName = () => {
    const trimmed = name.trim() || 'Learner';
    saveUser({ name: trimmed, createdAt: stored?.createdAt ?? new Date().toISOString() });
    setSaved(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto">👤</div>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{stored?.name || 'Guest User'}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {isGuest ? 'Create an account to save your name and preferences' : 'Your practice is saved on this device'}
        </p>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Your name</h2>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setSaved(false); }}
          placeholder="Apna naam"
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
        />
        <button onClick={saveName} className="btn-primary btn-md w-full mt-3">
          {isGuest ? 'Create Free Account' : saved ? '✓ Saved' : 'Save Name'}
        </button>
        {isGuest && (
          <button onClick={() => navigate('/onboarding')} className="btn-secondary btn-md w-full mt-2">
            Sign In / Set Goal
          </button>
        )}
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Benefits of an account</h2>
        <ul className="space-y-3">
          {[
            'Track your learning progress',
            'Save completed lessons',
            'Continue where you left off',
            'Unlock all courses',
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">✓</span>
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <button onClick={() => navigate('/free-trial')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-sm">🎤</span>
            <span className="font-medium text-gray-700 text-sm">Try Free Trial</span>
          </button>
          <button onClick={() => navigate('/courses')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-sm">📚</span>
            <span className="font-medium text-gray-700 text-sm">Browse Courses</span>
          </button>
          <button onClick={() => navigate('/pricing')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">💰</span>
            <span className="font-medium text-gray-700 text-sm">See Pricing</span>
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-bold text-gray-900 mb-3">Settings</h2>
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => {
              const next = !autoPlay;
              setAutoPlay(next);
              savePrefs({ autoPlay: next });
            }}
            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 w-full"
          >
            <span className="text-sm text-gray-700">Auto-play audio</span>
            <div className={`w-10 h-6 rounded-full relative ${autoPlay ? 'bg-brand-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 rounded-full bg-white absolute top-1 shadow-sm ${autoPlay ? 'right-1' : 'left-1'}`} />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
