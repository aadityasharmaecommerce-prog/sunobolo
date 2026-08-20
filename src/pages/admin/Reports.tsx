import { useState, useEffect } from 'react';

function fmt(paise: number) { return `₹${(paise / 100).toLocaleString('en-IN')}`; }

export default function AdminReports() {
  const [data, setData] = useState<any>(null);
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/reports?range=${range}`).then(r => r.json()).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [range]);

  if (loading) return <div className="py-20 text-center text-gray-400">Loading reports...</div>;
  if (!data) return <div className="py-20 text-center text-red-400">Failed to load</div>;

  const totalRevenue = (data.revenueByDay || []).reduce((s: number, d: any) => s + (d.revenue || 0), 0);
  const totalNewUsers = (data.newUsers || []).reduce((s: number, d: any) => s + (d.count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <div className="flex gap-1">
          {[
            { id: '7d', label: '7D' }, { id: '30d', label: '30D' },
            { id: '1m', label: '1M' }, { id: 'all', label: 'All' },
          ].map(r => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${range === r.id ? 'bg-indigo-100 text-indigo-700' : 'bg-white border border-gray-200 text-gray-600'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase">Revenue</p>
          <p className="text-xl font-extrabold text-green-600">{fmt(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <p className="text-[10px] text-gray-400 uppercase">New Members</p>
          <p className="text-xl font-extrabold text-blue-600">{totalNewUsers}</p>
        </div>
      </div>

      {/* Active vs Expired */}
      {data.activevsExpired?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Active vs Expired</h2>
          <div className="flex gap-4">
            {data.activevsExpired.map((a: any) => (
              <div key={a.status} className="text-center flex-1">
                <p className={`text-2xl font-extrabold ${a.status === 'active' ? 'text-green-600' : a.status === 'expired' ? 'text-amber-600' : 'text-gray-400'}`}>{a.count}</p>
                <p className="text-xs text-gray-500 capitalize">{a.status}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subscriptions by Plan */}
      {data.subsByPlan?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Subscriptions by Plan</h2>
          <div className="space-y-2">
            {data.subsByPlan.map((s: any) => {
              const labels: Record<string, string> = { three_month: '3 Months (₹599)', six_month: '6 Months (₹999)', one_year: '1 Year (₹1,700)' };
              return (
                <div key={s.package_id} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{labels[s.package_id] || s.package_id}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-green-600">{s.active} active</span>
                    <span className="text-sm font-bold text-gray-900">{s.count} total</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Courses */}
      {data.topCourses?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Most Popular Courses</h2>
          <div className="space-y-2">
            {data.topCourses.map((c: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{c.emoji} {c.title}</span>
                <span className="text-sm font-bold text-gray-900">{c.completions} completions</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revenue Chart */}
      {data.revenueByDay?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
          <h2 className="text-sm font-bold text-gray-900 mb-3">Daily Revenue</h2>
          <div className="flex items-end gap-1 h-32">
            {data.revenueByDay.map((d: any) => {
              const maxRev = Math.max(...data.revenueByDay.map((x: any) => x.revenue || 0), 1);
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
    </div>
  );
}
