import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Mic, TrendingUp, User, Target, BookMarked } from 'lucide-react';
import { useAuth } from '../lib/auth';

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const isPaid = subscription.active;

  const tabs = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'learn', label: 'Learn', icon: BookOpen, path: '/courses' },
    { id: 'read', label: 'Read', icon: BookMarked, path: '/reading' },
    ...(!isPaid ? [{ id: 'practice', label: 'Practice', icon: Mic, path: '/free-trial' }] : [{ id: 'journey', label: 'Journey', icon: Target, path: '/journey' }]),
    { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),8px)] pointer-events-none sm:hidden">
      <div className="max-w-xl mx-auto px-3 pointer-events-auto">
        <div className="dark-bottom-nav rounded-2xl shadow-[0_-2px_16px_rgba(0,0,0,0.3),0_8px_32px_-6px_rgba(0,0,0,0.4)] flex items-center justify-around px-1 py-1.5">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.path;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => navigate(tab.path)}
                aria-label={tab.label}
                className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-brand-400'
                    : 'text-white/35 hover:text-white/60'
                }`}
              >
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className={`transition-all duration-200 ${isActive ? 'scale-105 drop-shadow-[0_0_6px_rgba(167,139,250,0.5)]' : ''}`}
                  fill={isActive ? 'currentColor' : 'none'}
                />
                <span className={`text-[10px] sm:text-[11px] font-semibold leading-none mt-0.5 ${
                  isActive ? 'text-brand-400' : ''
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
