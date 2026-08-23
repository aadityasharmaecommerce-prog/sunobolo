/**
 * SunoBolo — ScrollToTop (Enhanced)
 *
 * Resets scroll to top on every route/pathname change.
 *
 * Key fixes over previous version:
 * 1. Uses multiple scroll methods (window.scrollTo, documentElement, body) for cross-browser compatibility
 * 2. Double RAF + setTimeout fallback ensures scroll fires AFTER DOM is painted
 * 3. Handles popstate (browser back/forward) explicitly
 * 4. MutationObserver as last-resort fallback for stubborn mobile browsers
 * 5. Proper cleanup of all timers and observers
 */

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Force scroll to top using multiple methods.
 * Different browsers use different elements for scrolling.
 */
function forceScrollToTop(): void {
  try { window.scrollTo(0, 0); } catch { /* ignore */ }
  try { document.documentElement.scrollTop = 0; } catch { /* ignore */ }
  try { document.body.scrollTop = 0; } catch { /* ignore */ }
}

export default function ScrollToTop() {
  const { pathname, key } = useLocation();
  const prevPathnameRef = useRef(pathname);
  const prevKeyRef = useRef(key);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const observerRef = useRef<MutationObserver | null>(null);

  // Clear all pending timers
  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // Disconnect observer
  const clearObserver = () => {
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  // Schedule a scroll with double RAF + timeout fallback
  const scheduleScroll = () => {
    clearTimers();

    // Method 1: Double RAF (fires after next paint)
    let rafCount = 0;
    const rafLoop = () => {
      rafCount++;
      forceScrollToTop();
      if (rafCount < 2) {
        const raf = requestAnimationFrame(rafLoop);
        timersRef.current.push(raf as unknown as ReturnType<typeof setTimeout>);
      }
    };
    const raf = requestAnimationFrame(rafLoop);
    timersRef.current.push(raf as unknown as ReturnType<typeof setTimeout>);

    // Method 2: setTimeout fallback (catches edge cases where RAF is delayed)
    const t1 = setTimeout(() => forceScrollToTop(), 50);
    timersRef.current.push(t1);

    // Method 3: Longer timeout for very slow mobile browsers
    const t2 = setTimeout(() => forceScrollToTop(), 200);
    timersRef.current.push(t2);
  };

  useEffect(() => {
    // Disable browser scroll restoration — we handle it ourselves
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Only act when the route actually changes
    if (pathname === prevPathnameRef.current && key === prevKeyRef.current) {
      return;
    }
    prevPathnameRef.current = pathname;
    prevKeyRef.current = key;

    clearTimers();
    clearObserver();

    // Immediate attempt
    forceScrollToTop();

    // Scheduled attempts
    scheduleScroll();

    // MutationObserver fallback: if DOM changes after our scroll, re-scroll
    // This handles cases where lazy content loads and shifts the scroll position
    const observer = new MutationObserver(() => {
      forceScrollToTop();
    });
    observerRef.current = observer;

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Disconnect observer after 1 second (enough time for all content to settle)
    const t3 = setTimeout(() => {
      clearObserver();
    }, 1000);
    timersRef.current.push(t3);

    return () => {
      clearTimers();
      clearObserver();
    };
  }, [pathname, key]);

  // Handle popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      forceScrollToTop();
      scheduleScroll();

      // One more attempt after a delay for mobile browsers
      const t = setTimeout(() => forceScrollToTop(), 100);
      timersRef.current.push(t);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
      clearObserver();
    };
  }, []);

  return null;
}
