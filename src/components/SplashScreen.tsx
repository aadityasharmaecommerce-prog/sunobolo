/**
 * SunoBolo — Premium Splash Screen
 * 
 * Shows for ~1.5s on app load, then fades out.
 * Respects prefers-reduced-motion.
 */
import { useState, useEffect } from 'react';

export default function SplashScreen() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setVisible(false); return; }
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="splash-screen" role="status" aria-label="Loading">
      <div className="splash-logo relative flex flex-col items-center">
        <div className="splash-glow absolute" />
        {/* Actual SunoBolo logo */}
        <img
          src="/images/logo.png"
          alt="SunoBolo"
          className="w-20 h-20 object-contain relative z-10"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(99,102,241,0.3))' }}
        />
        <span className="relative z-10 mt-3 text-xl font-extrabold text-white tracking-tight">
          Suno<span className="text-brand-200">Bolo</span>
        </span>
        <p className="relative z-10 text-white/50 text-xs mt-1 font-medium">Listen · Speak · Improve</p>
        <div className="splash-wave mt-6">
          {[1,2,3,4,5,6,7].map(i => <div key={i} className="splash-wave-bar" />)}
        </div>
      </div>
    </div>
  );
}
