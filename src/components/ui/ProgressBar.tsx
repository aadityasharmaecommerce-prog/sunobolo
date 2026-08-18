interface ProgressBarProps {
  percent: number;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProgressBar({ percent, color, size = 'md', showLabel = false, label, className = '' }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className={`progress ${className}`}>
      {(showLabel || label) && (
        <div className="progress__label">
          <span>{label}</span>
          <span>{clamped}%</span>
        </div>
      )}
      <div
        className={`progress__track progress__track--${size}`}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
      >
        <div
          className="progress__fill"
          style={{
            width: `${clamped}%`,
            background: color ? `var(--c-${color})` : 'var(--gradient-brand)',
          }}
        />
      </div>
    </div>
  );
}
