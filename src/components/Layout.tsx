import { Outlet, useLocation } from 'react-router-dom';
import { Headphones, User } from 'lucide-react';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding' || location.pathname === '/free-trial';
  return (
    <div className="min-h-screen page-canvas">
      {/* ── Premium Header ── */}
      <header className="sticky top-0 z-40 glass border-b border-surface-200/60 shadow-[0_1px_8px_rgba(15,23,42,0.04)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo — use actual logo.png asset */}
          <a href="/" className="flex items-center active:scale-[0.97] transition-transform">
            <img
              src="/images/logo.png"
              alt="SunoBolo English"
              className="h-8 w-auto object-contain"
              style={{ maxHeight: '32px' }}
            />
          </a>
          {/* Actions */}
          <div className="flex items-center gap-2">
            <a
              href="/free-trial"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-brand-700 bg-brand-50 border border-brand-200 rounded-full hover:bg-brand-100 transition-colors"
            >
              <Headphones size={14} strokeWidth={2.5} />
              Try Free
            </a>
            <a
              href="/free-trial"
              className="sm:hidden btn-premium px-3 py-1.5 text-xs btn-premium-gradient rounded-full"
            >
              <Headphones size={13} strokeWidth={2.5} />
              Free
            </a>
            <a
              href="/profile"
              className="w-8 h-8 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-100 hover:border-brand-300 transition-all"
              aria-label="Profile"
            >
              <User size={16} strokeWidth={2.5} />
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 pb-28 pt-4">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
