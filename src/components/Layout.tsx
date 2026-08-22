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

  return (
    <div className="min-h-screen dark-page">
      {/* ── Desktop Header ── */}
      <header className="sticky top-0 z-40 dark-glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          {/* Logo — single mark, no text duplicate */}
          <a href="/" className="flex items-center active:scale-[0.97] transition-transform">
            <img
              src="/images/logo.png"
              alt="SunoBolo English"
              className="h-8 w-auto object-contain brightness-0 invert"
              style={{ maxHeight: '32px' }}
            />
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
                      ? 'text-white bg-white/10'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions — one CTA + profile */}
          <div className="flex items-center gap-2">
            <a
              href="/free-trial"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-full transition-colors text-brand-700 bg-white hover:bg-gray-50 shadow-lg"
            >
              <Headphones size={14} strokeWidth={2.5} />
              Try 25 Free Sentences
            </a>
            <a
              href="/profile"
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white/10 text-white border border-white/20 hover:bg-white/20"
              aria-label="Profile"
            >
              <User size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-28 pt-4 sm:max-w-6xl">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
