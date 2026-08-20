import { useEffect, useState, useRef } from 'react';
import type { Badge } from '../config/badges';

/**
 * Slides in from top-right when a new badge is earned.
 * Shows ONE badge at a time. Auto-dismisses after 2.5s.
 * Queued: parent manages the queue — this component shows ONE badge.
 */
export default function BadgeToast({ badge, onDismiss }: { badge: Badge; onDismiss: () => void }) {
  const [show, setShow] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    dismissedRef.current = false;
    // Slide in after mount
    const t1 = setTimeout(() => setShow(true), 50);
    // Auto dismiss after 2.5s
    const t2 = setTimeout(() => {
      if (dismissedRef.current) return;
      setShow(false);
      setTimeout(() => {
        if (!dismissedRef.current) onDismiss();
      }, 350);
    }, 2500);
    return () => {
      dismissedRef.current = true;
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [badge.id, onDismiss]);

  const handleDismiss = () => {
    dismissedRef.current = true;
    setShow(false);
    setTimeout(onDismiss, 350);
  };

  return (
    <div
      className={`pointer-events-auto transition-all duration-300 ease-out ${
        show
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-3 scale-95'
      }`}
    >
      <div
        className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_-6px_rgb(15_23_42/_0.22)] px-4 py-3 w-[280px] cursor-pointer"
        onClick={handleDismiss}
      >
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}
        >
          {badge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-extrabold text-brand-600 uppercase tracking-wide">
            Badge Unlocked!
          </p>
          <p className="text-[13px] font-bold text-gray-900 truncate">{badge.name}</p>
          <p className="text-[10px] text-gray-500 truncate">{badge.description}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-300 hover:text-gray-500 text-lg leading-none shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
