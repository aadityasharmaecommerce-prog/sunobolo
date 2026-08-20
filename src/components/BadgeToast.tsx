import { useEffect, useState } from 'react';
import type { Badge } from '../config/badges';

/**
 * Slides in from top when a new badge is earned.
 * Auto-dismisses after 3.5s. Can be stacked (render multiple).
 */
export default function BadgeToast({ badge, onDismiss }: { badge: Badge; onDismiss: () => void }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Slide in after mount
    const t1 = setTimeout(() => setShow(true), 50);
    // Auto dismiss
    const t2 = setTimeout(() => {
      setShow(false);
      setTimeout(onDismiss, 400); // wait for slide-out
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto transition-all duration-400 ease-out ${
        show
          ? 'opacity-100 translate-y-0 scale-100'
          : 'opacity-0 -translate-y-4 scale-95'
      }`}
    >
      <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 shadow-[0_8px_32px_-6px_rgb(15_23_42/_0.18)] px-4 py-3 max-w-xs">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center text-2xl shadow-md shrink-0`}
        >
          {badge.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold text-brand-600 uppercase tracking-wide">
            Badge Unlocked!
          </p>
          <p className="text-sm font-bold text-gray-900 truncate">{badge.name}</p>
          <p className="text-[11px] text-gray-500 truncate">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}
