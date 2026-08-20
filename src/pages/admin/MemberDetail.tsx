import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PLAN_LABELS: Record<string, string> = { three_month: '3 Months', six_month: '6 Months', one_year: '1 Year' };
function fmt(paise: number) { return `₹${(paise / 100).toLocaleString('en-IN')}`; }
function fmtDate(d: string | null) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; }

export default function AdminMemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/members/${id}`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading...</div>;
  if (!data?.member) return <div className="py-20 text-center text-red-400">Member not found</div>;

  const m = data.member;
  const totalPaid = (data.payments || []).filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0);

  return (
    <div className="space-y-4 max-w-2xl">
      <button onClick={() => navigate('/admin/members')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">← Back to Members</button>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white flex items-center justify-center text-xl font-bold">{m.name?.[0] || '?'}</div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">{m.name}</h1>
            <p className="text-sm text-gray-500">{m.email || 'No email'}</p>
            {m.is_admin ? <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">Admin</span> : null}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div><p className="text-[10px] text-gray-400 uppercase">Joined</p><p className="text-sm font-semibold">{fmtDate(m.created_at)}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase">Login Method</p><p className="text-sm font-semibold">{m.google_id ? 'Google' : 'Email'}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase">Sentences Done</p><p className="text-sm font-semibold">{data.progressCount || 0}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase">Total Paid</p><p className="text-sm font-semibold text-green-600">{fmt(totalPaid)}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase">Payments</p><p className="text-sm font-semibold">{(data.payments || []).length}</p></div>
          <div><p className="text-[10px] text-gray-400 uppercase">Subscriptions</p><p className="text-sm font-semibold">{(data.subscriptions || []).length}</p></div>
        </div>
      </div>

      {/* Subscriptions */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-900">Subscriptions</h2></div>
        {(data.subscriptions || []).length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No subscriptions</p>}
        {data.subscriptions?.map((s: any) => (
          <div key={s.id} className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{PLAN_LABELS[s.package_id] || s.package_id}</p>
              <p className="text-xs text-gray-400">{fmtDate(s.started_at)} → {fmtDate(s.expires_at)}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${s.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-500'}`}>{s.status}</span>
          </div>
        ))}
      </div>

      {/* Payments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100"><h2 className="text-sm font-bold text-gray-900">Payments</h2></div>
        {(data.payments || []).length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No payments</p>}
        {data.payments?.map((p: any) => (
          <div key={p.id} className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{fmt(p.amount)} · {PLAN_LABELS[p.plan_id] || p.plan_id || '—'}</p>
              <p className="text-xs text-gray-400">{fmtDate(p.created_at)} · {p.razorpay_payment_id || '—'}</p>
            </div>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${p.status === 'paid' ? 'bg-green-50 text-green-700' : p.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{p.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
