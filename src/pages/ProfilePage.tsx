import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import type { Goal, UserLevel } from '@/types';
import { GOALS, LEVEL_OPTIONS, ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { useProgress } from '@/context/ProgressContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { formatMinutes } from '@/utils/dates';

export function ProfilePage() {
  usePageMeta('Profile — SunoBolo English', 'Apni profile aur progress.');
  const { user, isAuthenticated, updateProfile, logout } = useAuth();
  const { stats, resetProgress } = useProgress();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? '');
  const [goal, setGoal] = useState<Goal | ''>(user?.goal ?? '');
  const [level, setLevel] = useState<UserLevel | ''>(user?.level ?? '');

  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.login} replace />;
  }

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    updateProfile({ name, goal: goal || undefined, level: level || undefined });
    toast('Profile update ho gaya ✅');
  };

  return (
    <div className="dashboard container">
      <div className="dashboard__welcome">
        <h1>Profile 👤</h1>
        <p>Apni details aur learning preferences yahan manage karo.</p>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <h3 className="mb-2">Personal details</h3>
          <form onSubmit={onSave}>
            <div className="field">
              <label htmlFor="profile-name">Name</label>
              <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="profile-email">Email (read-only in Phase 1)</label>
              <input id="profile-email" value={user.email} disabled />
            </div>
            <div className="field">
              <label htmlFor="profile-goal">Goal</label>
              <select id="profile-goal" value={goal} onChange={(e) => setGoal(e.target.value as Goal | '')}>
                <option value="">— Chuno —</option>
                {GOALS.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="profile-level">Level</label>
              <select id="profile-level" value={level} onChange={(e) => setLevel(e.target.value as UserLevel | '')}>
                <option value="">— Chuno —</option>
                {LEVEL_OPTIONS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" size="lg">Save Changes</Button>
          </form>
        </div>

        <div className="profile-card">
          <h3 className="mb-2">My stats</h3>
          <div className="stats-grid">
            <StatCard emoji="🗣️" label="Sentences" value={stats.sentencesPracticed} />
            <StatCard emoji="✅" label="Lessons" value={stats.lessonsCompleted} />
            <StatCard emoji="🔥" label="Streak" value={`${stats.currentStreak}d`} />
            <StatCard emoji="⏱️" label="Time" value={formatMinutes(stats.totalMinutes)} />
          </div>

          <h3 className="mt-4 mb-2">Account</h3>
          <div className="flex flex-wrap">
            <Button variant="outline" to={ROUTES.pricing}>
              {user.hasPackage ? `Package: ${user.hasPackage} — Change` : 'Buy a package'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                if (window.confirm('Saari local progress delete ho jaayegi. Confirm karo?')) {
                  resetProgress();
                  toast('Progress reset ho gayi.', 'info');
                }
              }}
            >
              Reset progress
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                logout();
                toast('Logout ho gaya.', 'info');
              }}
            >
              Logout
            </Button>
          </div>
          <p className="demo-hint mt-2">Phase 1: sab data sirf is device ke localStorage mein hai — koi server nahi.</p>
        </div>
      </div>
    </div>
  );
}
