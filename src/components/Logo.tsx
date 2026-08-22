/**
 * SunoBolo — Premium Brand Mark
 * 
 * Minimal wordmark + sound wave symbol.
 * Works at any size: header, splash, favicon, app icon.
 */
export default function Logo({ size = 32, className = '', showText = true }: {
  size?: number;
  className?: string;
  showText?: boolean;
}) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Sound wave mark */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Background circle */}
        <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
        
        {/* Sound wave bars */}
        <rect x="8" y="14" width="3" height="12" rx="1.5" fill="white" opacity="0.9" />
        <rect x="13.5" y="10" width="3" height="20" rx="1.5" fill="white" />
        <rect x="19" y="8" width="3" height="24" rx="1.5" fill="white" />
        <rect x="24.5" y="12" width="3" height="16" rx="1.5" fill="white" />
        <rect x="30" y="15" width="3" height="10" rx="1.5" fill="white" opacity="0.9" />
        
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4f46e5" />
            <stop offset="0.5" stopColor="#6366f1" />
            <stop offset="1" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Wordmark */}
      {showText && (
        <span className="font-extrabold tracking-tight" style={{ fontSize: size * 0.55 }}>
          <span className="text-brand-900">Suno</span>
          <span className="text-brand-600">Bolo</span>
        </span>
      )}
    </div>
  );
}

/**
 * Splash screen logo — larger, with glow effect
 */
export function SplashLogo() {
  return (
    <div className="splash-logo relative flex flex-col items-center">
      {/* Glow ring */}
      <div className="splash-glow absolute" />
      
      {/* Logo */}
      <div className="relative z-10">
        <svg
          width="80"
          height="80"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="40" rx="10" fill="url(#splash-grad)" />
          <rect x="8" y="14" width="3" height="12" rx="1.5" fill="white" opacity="0.9" />
          <rect x="13.5" y="10" width="3" height="20" rx="1.5" fill="white" />
          <rect x="19" y="8" width="3" height="24" rx="1.5" fill="white" />
          <rect x="24.5" y="12" width="3" height="16" rx="1.5" fill="white" />
          <rect x="30" y="15" width="3" height="10" rx="1.5" fill="white" opacity="0.9" />
          <defs>
            <linearGradient id="splash-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" />
              <stop offset="1" stopColor="#c084fc" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {/* Wordmark */}
      <div className="relative z-10 mt-4">
        <span className="text-2xl font-extrabold tracking-tight text-white">
          Suno<span className="text-brand-200">Bolo</span>
        </span>
      </div>
      
      {/* Subtitle */}
      <p className="relative z-10 text-white/60 text-xs mt-1.5 font-medium tracking-wide">
        Listen · Speak · Improve
      </p>
      
      {/* Sound wave animation */}
      <div className="splash-wave mt-6">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="splash-wave-bar" />
        ))}
      </div>
    </div>
  );
}
