interface StatCardProps {
  emoji: string;
  label: string;
  value: string | number;
  hint?: string;
}

export function StatCard({ emoji, label, value, hint }: StatCardProps) {
  return (
    <div className="stat-card">
      <span className="stat-card__emoji" aria-hidden="true">
        {emoji}
      </span>
      <div className="stat-card__body">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
        {hint && <span className="stat-card__hint">{hint}</span>}
      </div>
    </div>
  );
}
