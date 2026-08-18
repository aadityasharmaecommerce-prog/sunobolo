import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/constants';

const NAV_ITEMS = [
  { to: ROUTES.home, label: 'Home' },
  { to: ROUTES.courses, label: 'Courses' },
  { to: ROUTES.pricing, label: 'Pricing' },
];

export function Header() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="header__inner container">
        <Link to={ROUTES.home} className="brand" aria-label="SunoBolo English — Home">
          <span className="brand__logo" aria-hidden="true">
            <svg viewBox="0 0 64 64" width="28" height="28" focusable="false">
              <rect width="64" height="64" rx="14" fill="var(--c-sky)" />
              <path d="M14 26v12h8l10 8V18l-10 8h-8z" fill="#fff" />
              <path d="M40 24c2.5 2.4 3.9 5.6 3.9 9s-1.4 6.6-3.9 9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              <path d="M46 19c4.2 4.2 6.4 9.4 6.4 15s-2.2 10.8-6.4 15" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" opacity="0.75" />
            </svg>
          </span>
          <span className="brand__text">
            <strong>SunoBolo</strong>
            <em>English</em>
          </span>
        </Link>

        <nav className="header__nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `header__link ${isActive ? 'header__link--active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="header__actions">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to={ROUTES.admin} className="header__link header__link--admin">
                  Admin
                </Link>
              )}
              <Link to={ROUTES.dashboard} className="header__avatar" aria-label="Dashboard" title={user?.name ?? 'Dashboard'}>
                {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
              </Link>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" to={ROUTES.login}>
                Login
              </Button>
              <Button variant="primary" size="sm" to={ROUTES.signup}>
                Start Free
              </Button>
            </>
          )}
          <button
            type="button"
            className="header__burger"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {open && (
        <nav className="header__mobile" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className="header__mobile-link" onClick={() => setOpen(false)}>
              {item.label}
            </NavLink>
          ))}
          {isAuthenticated && (
            <NavLink to={ROUTES.dashboard} className="header__mobile-link" onClick={() => setOpen(false)}>
              Dashboard
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to={ROUTES.admin} className="header__mobile-link" onClick={() => setOpen(false)}>
              Admin
            </NavLink>
          )}
          {!isAuthenticated && (
            <>
              <NavLink to={ROUTES.login} className="header__mobile-link" onClick={() => setOpen(false)}>
                Login
              </NavLink>
              <NavLink to={ROUTES.signup} className="header__mobile-link" onClick={() => setOpen(false)}>
                Start Free
              </NavLink>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
