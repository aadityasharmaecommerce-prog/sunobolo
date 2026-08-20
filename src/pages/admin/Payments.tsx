import { useState, useEffect, useCallback } from 'react';

const PLAN_LABELS: Record<string, string> = { three_month: '3 Months', six_month: '6 Months', one_year: '1 Year' };
function fmt(paise: number) { return `₹${(paise / 100).toLocaleString('en-IN')}`; }
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'; }

export default function AdminPayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), search, status });
    const res = await fetch(`/api/admin/payments?${params}`);
    const data = await res.json();
    setPayments(data.payments || []);
    setTotal(data.total || 0);
    setSummary(data.summary);
    setLoading(false);
  }, [page, search, status]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Payments</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Total Revenue</p>
            <p className="text-lg font-extrabold text-green-600">{fmt(summary.revenue)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Successful</p>
            <p className="text-lg font-extrabold text-green-600">{summary.success}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Failed</p>
            <p className="text-lg font-extrabold text-red-600">{summary.failed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <p className="text-[10px] text-gray-400 uppercase">Pending</p>
            <p className="text-lg font-extrabold text-amber-600">{summary.pending}</p>
          </div>
        </div>
      )}

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input type="text" placeholder="Search name, email, payment ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
        <div className="flex gap-1">
          {['all', 'paid', 'failed', 'pending'].map(s => (
            <button key={s} onClick={() => { setStatus(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${status === s ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Date</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Customer</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden sm:table-cell">Amount</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden md:table-cell">Plan</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 hidden lg:table-cell">Payment ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>}
            {!loading && payments.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No payments found</td></tr>}
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500">{fmtDate(p.created_at)}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 truncate max-w-[150px]">{p.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[150px]">{p.email || '—'}</p>
                </td>
                <td className="px-4 py-3 font-bold text-gray-900 hidden sm:table-cell">{fmt(p.amount)}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">{PLAN_LABELS[p.plan_id] || p.plan_id || '—'}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-50 text-green-700' : p.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400 font-mono hidden lg:table-cell truncate max-w-[120px]">{p.razorpay_payment_id || '—'}</td>
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
