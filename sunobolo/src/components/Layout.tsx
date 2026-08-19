import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding';
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white/90 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center active:scale-95 transition-transform">
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
            <a href="/free-trial" className="bg-brand-50 text-brand-700 font-semibold text-xs px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors">
              🎧 Free
            </a>
            <a href="/profile" className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-100 to-accent-100 flex items-center justify-center text-gray-600 hover:from-brand-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </a>
          </div>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 pb-24 pt-3">
        <Outlet />
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
