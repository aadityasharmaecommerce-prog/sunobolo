/**
 * SunoBolo — Notification Permission Prompt
 *
 * Shows immediately when user opens the website.
 * - Checks Notification.permission directly as source of truth
 * - Never shows if permission is 'granted' or 'denied'
 * - Respects dismissal state (won't re-show after "Not now")
 */

import { useState, useEffect } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { Bell, X } from 'lucide-react';

const DISMISS_KEY = 'sb_push_prompt_dismissed';

export default function NotificationPrompt() {
  const { isSupported, permission, isSubscribed, loading, subscribe } = usePushNotifications();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    // Check Notification.permission DIRECTLY — always the source of truth
    if (typeof Notification === 'undefined') return;

    const browserPermission = Notification.permission;

    // NEVER show if:
    // - not supported
    // - browser permission is 'granted' (already enabled)
    // - browser permission is 'denied' (blocked)
    // - already subscribed to push
    // - already dismissed by user
    // - still loading
    if (
      !isSupported ||
      browserPermission === 'granted' ||
      browserPermission === 'denied' ||
      isSubscribed ||
      loading
    ) {
      setVisible(false);
      return;
    }

    // Also check the hook's permission value (secondary check)
    if (permission === 'granted' || permission === 'denied') {
      setVisible(false);
      return;
    }

    // Check if user previously dismissed
    const wasDismissed = localStorage.getItem(DISMISS_KEY);
    if (wasDismissed) return;

    // Show immediately with a 2-second delay (so page loads first)
    const timer = setTimeout(() => {
      // Re-check permission before showing
      if (Notification.permission === 'granted' || Notification.permission === 'denied') {
        return;
      }
      setVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isSupported, permission, isSubscribed, loading]);

  const handleEnable = async () => {
    setSubscribing(true);
    const success = await subscribe();
    setSubscribing(false);

    if (success) {
      if (Notification.permission === 'granted') {
        setVisible(false);
      }
    } else {
      if (Notification.permission === 'denied') {
        setVisible(false);
      }
    }
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch { /* ignore */ }
  };

  // Final safety check: never render if permission is granted or denied
  if (
    !visible ||
    dismissed ||
    loading ||
    (typeof Notification !== 'undefined' && Notification.permission !== 'default')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-24 left-4 right-4 z-30 sm:left-auto sm:right-4 sm:max-w-sm animate-fade-up">
      <div className="dark-card p-4 rounded-2xl shadow-[0_16px_48px_-12px_rgba(108,77,255,0.3)] border-brand-500/20">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
            <Bell size={18} className="text-white" />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-sm font-bold text-white">Enable notifications? 🔔</p>
            <p className="text-xs text-white/50 mt-1">
              Get practice reminders and new course updates.
            </p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleEnable}
                disabled={subscribing}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 text-white text-xs font-bold hover:from-brand-600 hover:to-accent-600 transition-all disabled:opacity-50"
              >
                {subscribing ? 'Enabling...' : 'Enable'}
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-xl bg-white/5 text-white/50 text-xs font-semibold hover:bg-white/10 hover:text-white/70 transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
