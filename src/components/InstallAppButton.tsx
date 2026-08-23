import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

/**
 * PWA Install App Button
 *
 * - Android/Chrome: uses beforeinstallprompt for native install dialog
 * - iOS/Safari: shows step-by-step guide ("Tap Share → Add to Home Screen")
 * - Desktop: uses beforeinstallprompt if supported
 * - Already installed (standalone): hides the button
 */

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

export default function InstallAppButton({ variant = 'header' }: { variant?: 'header' | 'home' | 'footer' | 'mobile-menu' }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed → hide
    if (isStandalone()) {
      setInstalled(true);
      return;
    }

    // Listen for beforeinstallprompt (Chrome/Edge/Android)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // iOS detection
    if (isIOS() && !isStandalone()) {
      setShowIOSGuide(true);
      setShowInstall(true);
    }

    // Listen for successful install
    const installedHandler = () => {
      setInstalled(true);
      setShowInstall(false);
      setShowIOSGuide(false);
      setDeferredPrompt(null);
    };
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
      if (outcome === 'accepted') {
        setInstalled(true);
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  // Already installed — don't show anything
  if (installed || !showInstall) return null;

  // ── Mobile Menu variant (full-width in hamburger menu) ──
  if (variant === 'mobile-menu') {
    return (
      <button
        onClick={showIOSGuide ? () => setShowIOSGuide(true) : handleInstall}
        className="flex items-center gap-3 w-full px-0 py-3 text-sm font-semibold text-white/60 hover:text-white transition-colors cursor-pointer"
        aria-label="Install SunoBolo App"
      >
        <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
          <Download size={15} strokeWidth={2.5} className="text-white" />
        </span>
        Install App
      </button>
    );
  }

  // ── Header variant (compact pill — visible on all screens) ──
  if (variant === 'header') {
    return (
      <button
        onClick={showIOSGuide ? () => setShowIOSGuide(true) : handleInstall}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-1 shadow-sm hover:bg-indigo-100 transition-colors cursor-pointer"
        aria-label="Install SunoBolo App"
      >
        📲 Install
      </button>
    );
  }

  // ── Footer variant (small text link) ──
  if (variant === 'footer') {
    return (
      <button
        onClick={showIOSGuide ? () => setShowIOSGuide(true) : handleInstall}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors cursor-pointer"
        aria-label="Install SunoBolo App"
      >
        📲 Install App
      </button>
    );
  }

  // ── Home variant (larger card CTA) ──
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
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full mt-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold text-sm"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Install CTA Card */}
      <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-purple-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-sm flex-shrink-0">
            📲
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base">Install SunoBolo App</h3>
            <p className="text-white/80 text-xs mt-0.5">
              Learn English like an app — faster access from your home screen.
            </p>
          </div>
          <button
            onClick={showIOSGuide ? () => setShowIOSGuide(true) : handleInstall}
            className="bg-white text-indigo-600 font-bold text-sm px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 flex-shrink-0"
          >
            Install App
          </button>
        </div>
      </div>
    </>
  );
}
