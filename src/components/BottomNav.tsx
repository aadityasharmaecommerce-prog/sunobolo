import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Download, Mic, TrendingUp, User, Target, BookMarked } from 'lucide-react';
import { useAuth } from '../lib/auth';

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
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

  useEffect(() => {
    if (isStandalone()) return;
    if (isIOS() && !isStandalone()) setShowIOSGuide(true);
  }, []);

  return (
    <>
      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="dark-card-page p-6 max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center mx-auto mb-3">
                <Download size={24} className="text-brand-300" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-extrabold text-white">Install SunoBolo</h3>
              <p className="text-sm text-white/50 mt-1">Add to your home screen for the best experience</p>
            </div>
            <div className="space-y-3 text-sm text-white/60">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong className="text-white/80">Share</strong> button (box with arrow) at the bottom of Safari</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong className="text-white/80">"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong className="text-white/80">"Add"</strong> in the top-right corner</span>
              </div>
            </div>
            <button onClick={() => setShowIOSGuide(false)} className="w-full mt-4 py-3 btn-premium btn-premium-gradient rounded-xl text-sm font-bold">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Dark Premium Floating Bottom Nav — mobile only ── */}
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
    </>
  );
}
