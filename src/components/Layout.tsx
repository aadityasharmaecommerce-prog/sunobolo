import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding' || location.pathname === '/free-trial';
  return (
    <div className="min-h-screen page-canvas">
      <header className="sticky top-0 z-40 glass border-b border-gray-200/60 shadow-[0_1px_12px_rgb(15_23_42_/_0.04)]">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 active:scale-95 transition-transform">
            <div className="h-9 overflow-hidden flex items-center" style={{ maxWidth: '140px' }}>
              <img
                src="/images/logo.png"
                alt="SunoBolo English"
                style={{ height: '36px', width: 'auto', maxWidth: '140px', objectFit: 'contain', display: 'block' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-2.5 py-1 shadow-sm">
              <span className="stars text-[11px]">★</span> 4.9 · 10,000+ learners
            </span>
            <a href="/free-trial" className="btn-premium px-3.5 py-1.5 text-xs btn-premium-gradient rounded-full">
              🎧 Try Free
            </a>
            <a href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
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
