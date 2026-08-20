import { useEffect, useState } from 'react';

/**
 * Lightweight CSS-only confetti burst.
 * Renders for ~2.5s then auto-removes.
 */
export default function Confetti({ onDone }: { onDone?: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  const particles = Array.from({ length: 28 }, (_, i) => {
    const colors = ['#6366f1', '#a855f7', '#f59e0b', '#22c55e', '#ec4899', '#06b6d4', '#f97316'];
    const color = colors[i % colors.length];
    const left = 10 + Math.random() * 80;
    const delay = Math.random() * 0.4;
    const drift = (Math.random() - 0.5) * 120;
    const size = 6 + Math.random() * 6;
    const rotation = Math.random() * 360;
    return { color, left, delay, drift, size, rotation };
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {particles.map((p, i) => (
        <span
          key={i}
          className="confetti-particle"
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: i % 3 === 0 ? '50%' : i % 3 === 1 ? '2px' : '0',
            background: p.color,
            animationDelay: `${p.delay}s`,
            ['--drift' as string]: `${p.drift}px`,
            ['--rot' as string]: `${p.rotation}deg`,
          }}
        />
      ))}
    </div>
  );
}
