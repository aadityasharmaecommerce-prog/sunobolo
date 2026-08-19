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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-40 safe-area-bottom">
      <div className="max-w-2xl mx-auto px-2 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? 'text-brand-600 scale-105' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}