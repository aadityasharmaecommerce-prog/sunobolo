import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { ROUTES } from '@/constants';

export function BottomNav() {
  const { isAuthenticated } = useAuth();
  const { progress } = useProgress();

  const items = [
    { to: ROUTES.home, label: 'Home', emoji: '🏠' },
    { to: ROUTES.courses, label: 'Learn', emoji: '📚' },
    ...(progress.lastLesson && isAuthenticated
      ? [
          {
            to: ROUTES.lesson(progress.lastLesson.courseId, progress.lastLesson.lessonId),
            label: 'Practice',
            emoji: '🎤',
          },
        ]
      : []),
    { to: ROUTES.pricing, label: 'Pricing', emoji: '💎' },
    { to: isAuthenticated ? ROUTES.profile : ROUTES.login, label: isAuthenticated ? 'Profile' : 'Login', emoji: isAuthenticated ? '👤' : '🔑' },
  ];

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      {items.map((item) => (
        <NavLink
          key={item.label}
          to={item.to}
          className={({ isActive }) => `bottom-nav__item ${isActive ? 'bottom-nav__item--active' : ''}`}
        >
          <span className="bottom-nav__emoji" aria-hidden="true">
            {item.emoji}
          </span>
          <span className="bottom-nav__label">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
