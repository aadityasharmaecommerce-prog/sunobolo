import { usePageMeta } from '@/hooks/usePageMeta';
import { getDB } from '@/services/store';

const WEEK = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 78 },
  { day: 'Wed', value: 54 },
  { day: 'Thu', value: 91 },
  { day: 'Fri', value: 67 },
  { day: 'Sat', value: 45 },
  { day: 'Sun', value: 83 },
];

export function AdminDashboardPage() {
  usePageMeta('Admin Dashboard — SunoBolo English', 'Admin panel dashboard (mock).');
  const db = getDB();

  const statTiles = [
    { label: 'Courses', value: db.courses.length, emoji: '📚' },
    { label: 'Lessons', value: db.lessons.length, emoji: '📄' },
    { label: 'Sentences', value: db.sentences.length, emoji: '💬' },
    { label: 'Users', value: db.users.length, emoji: '👥' },
  ];

  return (
    <div>
      <h2 className="mb-2">Overview</h2>
      <div className="admin-grid mb-2">
        {statTiles.map((s) => (
          <div key={s.label} className="admin-stat">
            <div className="admin-stat__label">
              {s.emoji} {s.label}
            </div>
            <div className="admin-stat__value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card">
          <h3 className="mb-2">Practice activity (this week)</h3>
          <div className="chart" aria-label="Weekly practice activity chart">
            {WEEK.map((d) => (
              <div key={d.day} className="chart__bar" style={{ height: `${d.value}%` }} title={`${d.day}: ${d.value}%`}>
                <span>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h3 className="mb-2">Sentences by course</h3>
          <div className="chart" aria-label="Sentences per course chart">
            {db.courses.slice(0, 6).map((c) => (
              <div
                key={c.id}
                className="chart__bar"
                style={{ height: `${Math.min(100, Math.round((c.sentenceCount / 110) * 100))}%`, background: `var(--c-${c.color})` }}
                title={`${c.title}: ${c.sentenceCount}`}
              >
                <span>{c.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <p className="text-muted mt-2" style={{ fontSize: 'var(--fs-xs)' }}>
            Phase 1: ye analytics mock data se ban rahe hain. Phase 2 mein D1 analytics_events table se aayenge.
          </p>
        </div>
      </div>
    </div>
  );
}
