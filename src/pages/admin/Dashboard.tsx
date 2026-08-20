import { useState, useEffect } from 'react';

interface DashboardData {
  totalUsers: number; activeSubscriptions: number; expiredSubscriptions: number;
  totalPayments: number; successfulPayments: number; failedPayments: number;
  totalRevenue: number; recentPayments: any[]; planStats: any[]; dailyRevenue: any[];
}

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString('en-IN')}`; }
function fmtDate(d: string) { return d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : '—'; }

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard').then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading dashboard...</div>;
  if (!data) return <div className="py-20 text-center text-red-400">Failed to load dashboard</div>;

  const cards = [
    { label: 'Total Members', value: data.totalUsers, icon: '👥', color: 'bg-blue-50 text-blue-600' },
    { label: 'Active Subscriptions', value: data.activeSubscriptions, icon: '✅', color: 'bg-green-50 text-green-600' },
    { label: 'Expired Subscriptions', value: data.expiredSubscriptions, icon: '⏰', color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Revenue', value: fmt(data.totalRevenue), icon: '💰', color: 'bg-purple-50 text-purple-600' },
    { label: 'Successful Payments', value: data.successfulPayments, icon: '💳', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Failed Payments', value: data.failedPayments, icon: '❌', color: 'bg-red-50 text-red-600' },
  ];

  const planLabels: Record<string, string> = { three_month: '3 Months', six_month: '6 Months', one_year: '1 Year' };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map(c => (
          <div key={c.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-8 h-8 rounded-lg ${c.color} flex items-center justify-center text-sm`}>{c.icon}</span>
              <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{c.value}</p>
          </div>
        ))}
      </div>

      {/* Plan Stats */}
      {data.planStats.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Active by Plan</h2>
          <div className="flex gap-4">
            {data.planStats.map((p: any) => (
              <div key={p.package_id} className="text-center">
                <p className="text-lg font-extrabold text-indigo-600">{p.count}</p>
                <p className="text-xs text-gray-500">{planLabels[p.package_id] || p.package_id}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Revenue Chart (simple bar) */}
      {data.dailyRevenue.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Revenue (Last 30 Days)</h2>
          <div className="flex items-end gap-1 h-32">
            {data.dailyRevenue.map((d: any) => {
              const maxRev = Math.max(...data.dailyRevenue.map((x: any) => x.revenue || 0), 1);
              const h = Math.max(((d.revenue || 0) / maxRev) * 100, 4);
              return (
                <div key={d.day} className="flex-1 flex flex-col items-center gap-1" title={`${d.day}: ${fmt(d.revenue)}`}>
                  <div className="w-full bg-indigo-400 rounded-t" style={{ height: `${h}%` }} />
                  <p className="text-[8px] text-gray-400">{d.day.slice(5)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">Recent Payments</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {data.recentPayments.length === 0 && <p className="px-4 py-6 text-sm text-gray-400 text-center">No payments yet</p>}
          {data.recentPayments.map((p: any) => (
            <div key={p.id} className="px-4 py-3 flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'paid' ? 'bg-green-400' : p.status === 'failed' ? 'bg-red-400' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.name || 'Unknown'}</p>
                <p className="text-[11px] text-gray-400">{p.email || '—'} · {fmtDate(p.created_at)}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-900">{fmt(p.amount)}</p>
                <p className={`text-[10px] font-semibold ${p.status === 'paid' ? 'text-green-600' : p.status === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
