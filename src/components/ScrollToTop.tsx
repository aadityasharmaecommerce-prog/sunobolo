/**
 * SunoBolo — ScrollToTop (v3 — Mobile-Fixed)
 *
 * Scrolls to top on every internal route change.
 *
 * KEY FIX: Uses useLayoutEffect instead of useEffect.
 * - useEffect fires AFTER paint → mobile browsers restore old scroll first
 * - useLayoutEffect fires BEFORE paint → scroll happens before browser can restore
 *
 * Strategy:
 * - useLayoutEffect: immediate scrollTo(0,0) before browser paints
 * - Double requestAnimationFrame: catches any post-paint edge cases
 * - setTimeout fallback at 50ms and 200ms: catches slow async content
 * - popstate handler: prevents browser back/forward scroll restoration
 * - history.scrollRestoration = 'manual' is set in main.tsx (before first render)
 */

import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/** Force scroll to top using all available methods for cross-browser compat. */
function forceScrollToTop(): void {
  // 1. Standard window scroll
  try { window.scrollTo(0, 0); } catch { /* ignore */ }
  // 2. documentElement (used by some browsers)
  try { document.documentElement.scrollTop = 0; } catch { /* ignore */ }
  // 3. body (used by some mobile browsers)
  try { document.body.scrollTop = 0; } catch { /* ignore */ }
  // 4. #root container (mobile Safari can make this the scroll owner
  //    when it has height:100% + overflow-x:hidden)
  try {
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
  } catch { /* ignore */ }
  // 5. Any other scrollable ancestor that might own the scroll
  try {
    const main = document.querySelector('main');
    if (main && main.scrollTop > 0) main.scrollTop = 0;
  } catch { /* ignore */ }
}

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();
  const prevPathRef = useRef(`${pathname}${search}${hash}`);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach(t => clearTimeout(t));
    timersRef.current = [];
  };

  // useLayoutEffect fires SYNCHRONOUSLY before browser paint.
  // This prevents mobile browsers from restoring old scroll positions.
  useLayoutEffect(() => {
    const fullPath = `${pathname}${search}${hash}`;

    // Only act when the full path actually changes
    if (fullPath === prevPathRef.current) return;
    prevPathRef.current = fullPath;

    clearTimers();

    // Handle hash navigation — scroll to the element instead of top
    if (hash) {
      const id = hash.slice(1);
      const t0 = setTimeout(() => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          return;
        }
        forceScrollToTop();
      }, 50);
      timersRef.current.push(t0);
      return () => clearTimers();
    }

    // No hash — scroll to top IMMEDIATELY (before paint)
    forceScrollToTop();

    // Double RAF: catches edge cases where browser still tries to restore after paint
    let rafCount = 0;
    const rafLoop = () => {
      rafCount++;
      forceScrollToTop();
      if (rafCount < 2) requestAnimationFrame(rafLoop);
    };
    requestAnimationFrame(rafLoop);

    // setTimeout fallbacks for async content that loads after initial render
    // (images, API data, lazy components, fonts)
    const t1 = setTimeout(() => forceScrollToTop(), 50);
    const t2 = setTimeout(() => forceScrollToTop(), 200);
    timersRef.current.push(t1, t2);

    return () => clearTimers();
  }, [pathname, search, hash]);

  // Handle popstate (browser back/forward) — prevent browser scroll restoration
  useLayoutEffect(() => {
    const handlePopState = () => {
      // Force scroll to top immediately when browser back/forward is triggered
      forceScrollToTop();
      // Additional scroll attempts to catch mobile browser quirks
      requestAnimationFrame(() => forceScrollToTop());
      const t = setTimeout(() => forceScrollToTop(), 50);
      timersRef.current.push(t);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearTimers();
    };
  }, []);

  return null;
}
