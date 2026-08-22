import { Outlet, useLocation } from 'react-router-dom';
import { Headphones, User, BookOpen, Mic } from 'lucide-react';
import BottomNav from './BottomNav';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: null },
  { label: 'Learn', path: '/courses', icon: BookOpen },
  { label: 'Practice', path: '/free-trial', icon: Mic },
  { label: 'Grammar', path: '/tenses', icon: null },
  { label: 'Pricing', path: '/pricing', icon: null },
];

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding' || location.pathname === '/free-trial';
  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isHome ? 'dark-canvas' : 'page-canvas'}`}>
      {/* ── Desktop Header ── */}
      <header className={`sticky top-0 z-40 ${isHome ? 'dark-glass-nav' : 'glass border-b border-surface-200/60 shadow-[0_1px_8px_rgba(15,23,42,0.04)]'}`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center active:scale-[0.97] transition-transform">
            {isHome ? (
              <>
                <img
                  src="/images/logo.png"
                  alt="SunoBolo English"
                  className="h-8 w-auto object-contain brightness-0 invert"
                  style={{ maxHeight: '32px' }}
                />
                <span className="ml-2 text-sm font-extrabold text-white tracking-tight hidden sm:inline">
                  Suno<span className="text-brand-300">Bolo</span>
                </span>
              </>
            ) : (
              <img
                src="/images/logo.png"
                alt="SunoBolo English"
                className="h-8 w-auto object-contain"
                style={{ maxHeight: '32px' }}
              />
            )}
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.label}
                  href={item.path}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                    isActive
                      ? isHome
                        ? 'text-white bg-white/10'
                        : 'text-brand-700 bg-brand-50'
                      : isHome
                        ? 'text-white/70 hover:text-white hover:bg-white/5'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/free-trial"
              className={`hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-colors ${
                isHome
                  ? 'text-brand-700 bg-white hover:bg-gray-50 shadow-lg'
                  : 'text-brand-700 bg-brand-50 border border-brand-200 hover:bg-brand-100'
              }`}
            >
              <Headphones size={14} strokeWidth={2.5} />
              Try Free
            </a>
            <a
              href="/free-trial"
              className={`sm:hidden btn-premium px-3 py-1.5 text-xs rounded-full ${
                isHome ? 'bg-white text-brand-700 shadow-lg' : 'btn-premium-gradient'
              }`}
            >
              <Headphones size={13} strokeWidth={2.5} />
              Free
            </a>
            <a
              href="/profile"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                isHome
                  ? 'bg-white/10 text-white border border-white/20 hover:bg-white/20'
                  : 'bg-brand-50 border border-brand-200 text-brand-600 hover:bg-brand-100 hover:border-brand-300'
              }`}
              aria-label="Profile"
            >
              <User size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </header>

      <main className={`max-w-2xl mx-auto px-4 pb-28 pt-4 ${isHome ? 'sm:max-w-6xl' : ''}`}>
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
