import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Download, Mic, TrendingUp, User } from 'lucide-react';

const tabs = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'learn', label: 'Learn', icon: BookOpen, path: '/courses' },
  { id: 'install', label: 'Install', icon: Download, path: '__install__' },
  { id: 'practice', label: 'Practice', icon: Mic, path: '/free-trial' },
  { id: 'progress', label: 'Progress', icon: TrendingUp, path: '/progress' },
  { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
] as const;

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return; }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);

    if (isIOS() && !isStandalone()) setShowIOSGuide(true);

    const installedHandler = () => { setInstalled(true); setDeferredPrompt(null); };
    window.addEventListener('appinstalled', installedHandler);
    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('appinstalled', installedHandler);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const handleTabClick = (tab: typeof tabs[number]) => {
    if (tab.id === 'install') {
      if (showIOSGuide) setShowIOSGuide(true);
      else handleInstall();
      return;
    }
    navigate(tab.path);
  };

  const visibleTabs = installed
    ? tabs.filter(t => t.id !== 'install')
    : tabs;

  return (
    <>
      {/* iOS Install Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowIOSGuide(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto mb-3">
                <Download size={24} className="text-brand-600" strokeWidth={2} />
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">Install SunoBolo</h3>
              <p className="text-sm text-gray-500 mt-1">Add to your home screen for the best experience</p>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                <span>Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">2</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-surface-50 rounded-xl">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 text-xs font-bold flex items-center justify-center shrink-0">3</span>
                <span>Tap <strong>"Add"</strong> in the top-right corner</span>
              </div>
            </div>
            <button onClick={() => setShowIOSGuide(false)} className="w-full mt-4 py-3 btn-premium btn-premium-gradient rounded-xl text-sm font-bold">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* ── Premium Floating Bottom Nav ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),8px)] pointer-events-none">
        <div className="max-w-xl mx-auto px-3 pointer-events-auto">
          <div className="glass rounded-2xl border border-surface-200/80 shadow-[0_-2px_16px_rgba(15,23,42,0.06),0_8px_32px_-6px_rgba(15,23,42,0.12)] flex items-center justify-around px-1 py-1.5">
            {visibleTabs.map((tab) => {
              const isActive = tab.id !== 'install' && location.pathname === tab.path;
              const isInstall = tab.id === 'install';
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  aria-label={tab.label}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-2.5 sm:px-3 rounded-xl transition-all duration-200 ${
                    isInstall
                      ? 'text-brand-600'
                      : isActive
                        ? 'nav-pill-active'
                        : 'text-surface-400 hover:text-surface-600'
                  }`}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={`transition-all duration-200 ${isActive ? 'scale-105' : ''}`}
                    fill={isActive ? 'currentColor' : 'none'}
                  />
                  <span className={`text-[10px] sm:text-[11px] font-semibold leading-none mt-0.5 ${
                    isInstall ? 'text-brand-600 font-bold' : isActive ? 'text-brand-700' : ''
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
