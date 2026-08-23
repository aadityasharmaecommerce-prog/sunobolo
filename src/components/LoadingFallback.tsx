/**
 * SunoBolo — Premium Loading Fallback
 *
 * Used for:
 * - Suspense lazy-loaded routes (Tenses, Journey, etc.)
 * - Async page transitions
 * - Any genuine loading state
 *
 * Design: SunoBolo logo + subtle pulse animation + loading text.
 * Feels premium and branded, not generic.
 */
export default function LoadingFallback({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      {/* Logo with pulse */}
      <div className="relative animate-pulse-soft">
        <img
          src="/images/logo.png"
          alt="SunoBolo"
          className="h-12 w-auto object-contain"
          style={{ filter: 'drop-shadow(0 2px 8px rgba(99,102,241,0.2))' }}
        />
      </div>
      {/* Loading text */}
      <p className="text-sm text-white/40 font-medium">{text}</p>
    </div>
  );
}
