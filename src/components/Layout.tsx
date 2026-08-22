import { Outlet, useLocation } from 'react-router-dom';
import { Headphones, User } from 'lucide-react';
import BottomNav from './BottomNav';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Learn', path: '/courses' },
  { label: 'Practice', path: '/free-trial' },
  { label: 'Grammar', path: '/tenses' },
  { label: 'Pricing', path: '/pricing' },
];

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding' || location.pathname === '/free-trial';

  return (
    <div className="min-h-screen dark-page" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── Premium Floating Header ── */}
      <header className="sticky top-0 z-40 dark-glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5 active:scale-[0.97] transition-transform shrink-0">
            <img
              src="/images/logo.png"
              alt="SunoBolo English"
              className="h-10 w-auto object-contain"
              style={{ maxHeight: '40px' }}
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-0.5 ml-8">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <a
                  key={item.label}
                  href={item.path}
                  className={`px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/free-trial"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold rounded-full transition-all text-white bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 shadow-[0_4px_16px_-4px_rgba(108,77,255,0.5)]"
            >
              <Headphones size={15} strokeWidth={2.5} />
              Try 25 Free Sentences
            </a>
            <a
              href="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/8 text-white/70 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15"
              aria-label="Profile"
            >
              <User size={17} strokeWidth={2} />
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
