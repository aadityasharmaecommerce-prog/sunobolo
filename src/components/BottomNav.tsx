import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { id: 'learn', label: 'Learn', icon: '📚', path: '/courses' },
  { id: 'practice', label: 'Practice', icon: '🎤', path: '/free-trial' },
  { id: 'progress', label: 'Progress', icon: '📈', path: '/progress' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
] as const;

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),10px)] pointer-events-none">
      <div className="max-w-xl mx-auto px-3 pointer-events-auto">
        <div className="glass rounded-2xl border border-white/70 shadow-[0_8px_32px_-6px_rgb(15_23_42_/_0.18)] flex items-center justify-around px-1.5 py-1.5">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-1.5 px-2.5 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-brand-700'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                )}
                <span
                  className={`text-xl leading-none transition-transform duration-300 ${
                    isActive ? 'scale-110 -translate-y-0.5' : ''
                  }`}
                >
                  {tab.icon}
                </span>
                <span className={`text-[10px] font-semibold ${isActive ? 'text-brand-700' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-brand-50 to-accent-50 border border-brand-100/80" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
