import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Member { id: string; name: string; email: string; created_at: string; is_admin: number; google_id: string | null; plan: string | null; sub_status: string | null; started_at: string | null; expires_at: string | null; }

const FILTERS = [
  { id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'expired', label: 'Expired' },
  { id: 'google', label: 'Google Login' }, { id: '3month', label: '3 Months' },
  { id: '6month', label: '6 Months' }, { id: '1year', label: '1 Year' },
];

const PLAN_LABELS: Record<string, string> = { three_month: '3 Months', six_month: '6 Months', one_year: '1 Year' };
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'; }

export default function AdminMembers() {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search, filter });
    const res = await fetch(`/api/admin/members?${params}`);
    const data = await res.json();
    setMembers(data.members || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [page, search, filter]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Members ({total})</h1>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder="Search name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
        <div className="flex gap-1 overflow-x-auto">
          {FILTERS.map(f => (
            <button key={f.id} onClick={() => { setFilter(f.id); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${filter === f.id ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Name</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">Email</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden md:table-cell">Plan</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden lg:table-cell">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>}
            {!loading && members.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No members found</td></tr>}
            {members.map(m => (
              <tr key={m.id} onClick={() => navigate(`/admin/members/${m.id}`)} className="hover:bg-gray-50 cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold shrink-0">{m.name?.[0] || '?'}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">{m.name}{m.is_admin ? <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">Admin</span> : ''}</p>
                      <p className="text-xs text-gray-400 sm:hidden truncate">{m.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell truncate max-w-[200px]">{m.email || '—'}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {m.plan ? <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{PLAN_LABELS[m.plan] || m.plan}</span> : <span className="text-xs text-gray-400">Free</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${m.sub_status === 'active' ? 'bg-green-50 text-green-700' : m.sub_status === 'expired' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-500'}`}>
                    {m.sub_status || 'No plan'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{fmtDate(m.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40">← Prev</button>
          <span className="text-xs text-gray-500">Page {page} of {Math.ceil(total / 20)}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}
