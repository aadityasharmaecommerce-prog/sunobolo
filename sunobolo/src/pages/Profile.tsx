import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();
  const isGuest = true;

  if (isGuest) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto">👤</div>
          <h1 className="text-xl font-bold text-gray-900 mt-4">Guest User</h1>
          <p className="text-gray-500 text-sm mt-1">Create an account to save your progress</p>
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
          <button className="btn-primary btn-lg w-full mt-4">Create Free Account</button>
          <button className="btn-secondary btn-md w-full mt-2">Sign In</button>
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
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-700">Auto-play audio</span>
              <div className="w-10 h-6 rounded-full bg-brand-500 relative cursor-pointer">
                <div className="w-4 h-4 rounded-full bg-white absolute top-1 right-1 shadow-sm" />
              </div>
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer">
              <span className="text-sm text-gray-700">Audio speed</span>
              <select className="text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                <option>0.75x</option>
                <option selected>1x</option>
                <option>1.25x</option>
                <option>1.5x</option>
              </select>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center py-8">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto">👤</div>
        <h1 className="text-xl font-bold text-gray-900 mt-4">User Profile</h1>
      </div>
    </div>
  );
}