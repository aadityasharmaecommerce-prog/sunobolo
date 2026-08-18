import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';

const ADMIN_LINKS = [
  { to: '/admin', label: 'Dashboard', emoji: '📊', end: true },
  { to: '/admin/courses', label: 'Courses', emoji: '📚' },
  { to: '/admin/lessons', label: 'Lessons', emoji: '📄' },
  { to: '/admin/sentences', label: 'Sentences', emoji: '💬' },
  { to: '/admin/categories', label: 'Categories', emoji: '🏷️' },
  { to: '/admin/users', label: 'Users', emoji: '👥' },
  { to: '/admin/packages', label: 'Packages', emoji: '💎' },
  { to: '/admin/analytics', label: 'Analytics', emoji: '📈' },
  { to: '/admin/settings', label: 'Settings', emoji: '⚙️' },
];

export function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // Simple mock guard: only admin users can see the panel.
  if (!isAdmin) {
    return (
      <div className="admin-guard">
        <div className="card" style={{ maxWidth: 420, margin: '4rem auto', padding: '2rem', textAlign: 'center' }}>
          <span style={{ fontSize: 48 }} aria-hidden="true">🔐</span>
          <h2>Admin access required</h2>
          <p>
            Mock admin demo: login page par <code>admin@sunobolo.com</code> aur koi bhi password (4+ characters)
            use karein — admin access mil jaayega.
          </p>
          <button className="btn btn--primary" onClick={() => navigate(ROUTES.login)}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">SunoBolo Admin</div>
        <nav className="admin-sidebar__nav" aria-label="Admin navigation">
          {ADMIN_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`}
            >
              <span aria-hidden="true">{link.emoji}</span> {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <span className="admin-topbar__title">Admin Panel — mock data (Phase 1)</span>
          <div className="admin-topbar__user">
            <span className="header__avatar">{user?.name?.charAt(0)?.toUpperCase()}</span>
            <span>{user?.name}</span>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => {
                logout();
                navigate(ROUTES.home);
              }}
            >
              Logout
            </button>
          </div>
        </header>
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
