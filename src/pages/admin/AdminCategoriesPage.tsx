import { AUDIENCE_LABELS, LEVEL_LABELS } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getDB } from '@/services/store';
import { Badge } from '@/components/ui/Badge';

export function AdminCategoriesPage() {
  usePageMeta('Admin Categories — SunoBolo English', '');
  const db = getDB();

  const levelCounts = Object.entries(LEVEL_LABELS).map(([level, label]) => ({
    level,
    label,
    count: db.courses.filter((c) => c.level === level).length,
    sentences: db.sentences.filter((s) => s.courseId === level).length,
  }));

  const audienceCounts = Object.entries(AUDIENCE_LABELS).map(([aud, label]) => ({
    aud,
    label,
    count: db.courses.filter((c) => c.audience === aud).length,
  }));

  return (
    <div>
      <h2 className="mb-2">Categories & Levels</h2>
      <p className="text-muted mb-2" style={{ fontSize: 'var(--fs-sm)' }}>
        Phase 1: categories are derived from course metadata. Phase 2 mein ye D1 ke course_categories table se aayenge.
      </p>

      <div className="card mb-2">
        <h3 className="mb-2">Levels</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Label</th>
                <th>Courses</th>
                <th>Sentences</th>
              </tr>
            </thead>
            <tbody>
              {levelCounts.map((l) => (
                <tr key={l.level}>
                  <td><Badge variant="info">{l.level}</Badge></td>
                  <td>{l.label}</td>
                  <td>{l.count}</td>
                  <td>{l.sentences}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="mb-2">Audiences</h3>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Audience</th>
                <th>Courses</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {audienceCounts.map((a) => (
                <tr key={a.aud}>
                  <td><Badge variant="neutral">{a.aud}</Badge></td>
                  <td>{a.count}</td>
                  <td>
                    {db.courses
                      .filter((c) => c.audience === a.aud)
                      .map((c) => c.title)
                      .join(', ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
