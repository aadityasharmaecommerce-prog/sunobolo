import { usePageMeta } from '@/hooks/usePageMeta';
import { getDB } from '@/services/store';

const SIGNUPS = [
  { label: 'Jul', value: 34 },
  { label: 'Aug', value: 52 },
  { label: 'Sep', value: 48 },
  { label: 'Oct', value: 71 },
  { label: 'Nov', value: 88 },
  { label: 'Dec', value: 65 },
];

export function AdminAnalyticsPage() {
  usePageMeta('Admin Analytics — SunoBolo English', '');
  const db = getDB();
  const freeCount = db.sentences.filter((s) => s.isFree).length;

  return (
    <div>
      <h2 className="mb-2">Analytics</h2>
      <p className="text-muted mb-2" style={{ fontSize: 'var(--fs-sm)' }}>
        Phase 1: sab charts mock data par based hain. Phase 2 mein analytics_events table se real data aayega.
      </p>

      <div className="admin-grid mb-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="admin-stat">
          <div className="admin-stat__label">Mock signups (Dec)</div>
          <div className="admin-stat__value">1,284</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Sentences practiced</div>
          <div className="admin-stat__value">48,221</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Paid conversions</div>
          <div className="admin-stat__value">12.4%</div>
        </div>
        <div className="admin-stat">
          <div className="admin-stat__label">Free vs paid sentences</div>
          <div className="admin-stat__value">{Math.round((freeCount / db.sentences.length) * 100)}% free</div>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2">Mock signups — last 6 months</h3>
        <div className="chart" aria-label="Signups per month chart">
          {SIGNUPS.map((m) => (
            <div key={m.label} className="chart__bar" style={{ height: `${m.value}%` }} title={`${m.label}: ${m.value}`}>
              <span>{m.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
