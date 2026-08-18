import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  usePageMeta('Login — SunoBolo English', 'Apne SunoBolo account mein login karein.');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(email, password);
      navigate(ROUTES.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login fail ho gaya.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Welcome back 👋</h1>
        <p>Apni practice continue karo.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" fullWidth size="lg" disabled={busy}>
            {busy ? 'Logging in…' : 'Login'}
          </Button>
        </form>
        <p className="auth-switch">
          <Link to={ROUTES.forgotPassword}>Forgot password?</Link>
        </p>
        <p className="auth-switch">
          Naye ho? <Link to={ROUTES.signup}>Sign up free</Link>
        </p>
        <p className="demo-hint">Mock auth (Phase 1): koi bhi email + 4+ character password chalega. Admin demo: admin@sunobolo.com</p>
      </div>
    </div>
  );
}
