import { useState } from 'react';
import { usePageMeta } from '@/hooks/usePageMeta';
import { getDB } from '@/services/store';
import { Badge } from '@/components/ui/Badge';

export function AdminUsersPage() {
  usePageMeta('Admin Users — SunoBolo English', '');
  const [rows] = useState(() => [...getDB().users]);
  const db = getDB();
  const packageName = (id: string | null | undefined) => (id ? db.packages.find((p) => p.id === id)?.name ?? id : '—');

  return (
    <div>
      <h2 className="mb-2">Users ({rows.length})</h2>
      <p className="text-muted mb-2" style={{ fontSize: 'var(--fs-sm)' }}>
        Phase 1: ye mock users hain (admin panel demo). Phase 2 mein D1 users table se aayenge.
      </p>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Goal</th>
              <th>Level</th>
              <th>Package</th>
              <th>Admin</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id}>
                <td>
                  <strong>{u.name}</strong>
                </td>
                <td>{u.email}</td>
                <td>{u.goal ?? '—'}</td>
                <td>{u.level ?? '—'}</td>
                <td>
                  {u.hasPackage ? <Badge variant="info">{packageName(u.hasPackage)}</Badge> : <Badge variant="locked">Free</Badge>}
                </td>
                <td>{u.isAdmin ? <Badge variant="danger">Admin</Badge> : '—'}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
