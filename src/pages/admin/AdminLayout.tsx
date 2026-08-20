import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
  { id: 'members', label: 'Members', icon: '👥', path: '/admin/members' },
  { id: 'payments', label: 'Payments', icon: '💳', path: '/admin/payments' },
  { id: 'reports', label: 'Reports', icon: '📈', path: '/admin/reports' },
] as const;

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  if (!user) { navigate('/login', { replace: true }); return null; }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 z-50 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">SB</div>
            <div>
              <p className="text-sm font-bold text-gray-900">SunoBolo</p>
              <p className="text-[10px] text-gray-400">Admin Panel</p>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {NAV.map((n) => {
            const active = location.pathname === n.path || (n.path !== '/admin' && location.pathname.startsWith(n.path));
            return (
              <button key={n.id} onClick={() => { navigate(n.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                <span className="text-lg">{n.icon}</span>{n.label}
              </button>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-100">
          <div className="flex items-center gap-2 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">{user.name?.[0] || 'A'}</div>
            <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-gray-900 truncate">{user.name}</p><p className="text-[10px] text-gray-400 truncate">{user.email}</p></div>
          </div>
          <button onClick={() => navigate('/')} className="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 text-center py-1">← Back to Site</button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-12 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 text-xl">☰</button>
          <p className="text-sm font-bold text-gray-900">Admin Panel</p>
        </div>
        <main className="p-4 lg:p-6 max-w-7xl mx-auto"><Outlet /></main>
      </div>
    </div>
  );
}
