import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠', path: '/' },
  { id: 'learn', label: 'Learn', icon: '📚', path: '/courses' },
  { id: 'install', label: 'Install', icon: '📲', path: '__install__' },
  { id: 'practice', label: 'Practice', icon: '🎤', path: '/free-trial' },
  { id: 'progress', label: 'Progress', icon: '📈', path: '/progress' },
  { id: 'profile', label: 'Profile', icon: '👤', path: '/profile' },
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
              <div className="text-4xl mb-2">📲</div>
              <h3 className="text-lg font-bold text-gray-900">Install SunoBolo</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-lg">1️⃣</span>
                <span>Tap the <strong>Share</strong> button (box with arrow) at the bottom of Safari</span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-lg">2️⃣</span>
                <span>Scroll down and select <strong>"Add to Home Screen"</strong></span>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-lg">3️⃣</span>
                <span>Tap <strong>"Add"</strong> in the top-right corner</span>
              </div>
            </div>
            <button onClick={() => setShowIOSGuide(false)} className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm">Got it!</button>
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),10px)] pointer-events-none">
        <div className="max-w-xl mx-auto px-3 pointer-events-auto">
          <div className="glass rounded-2xl border border-white/70 shadow-[0_8px_32px_-6px_rgb(15_23_42_/_0.18)] flex items-center justify-around px-1.5 py-1.5">
            {visibleTabs.map((tab) => {
              const isActive = tab.id !== 'install' && location.pathname === tab.path;
              const isInstall = tab.id === 'install';
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  aria-label={tab.label}
                  className={`relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 sm:px-3 rounded-xl transition-all duration-300 ${
                    isInstall
                      ? 'text-indigo-600'
                      : isActive
                        ? 'text-brand-700'
                        : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  {isActive && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
                  )}
                  <span
                    className={`text-2xl leading-none transition-transform duration-300 ${
                      isActive ? 'scale-110 -translate-y-0.5' : ''
                    }`}
                  >
                    {tab.icon}
                  </span>
                  <span className={`text-[10px] sm:text-[11px] font-semibold ${
                    isInstall ? 'text-indigo-600 font-bold' : isActive ? 'text-brand-700' : ''
                  }`}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <span className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-brand-50 to-accent-50 border border-brand-100/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
