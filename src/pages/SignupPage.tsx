import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function SignupPage() {
  usePageMeta('Sign up — SunoBolo English', 'Free mein account banao aur English speaking practice shuru karo.');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signup(name, email, password);
      navigate(ROUTES.onboarding);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup fail ho gaya.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Start Free 🚀</h1>
        <p>2 minute mein account — phir turant practice shuru.</p>
        {error && <div className="form-error">{error}</div>}
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Apna naam"
              required
              autoComplete="name"
            />
          </div>
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
              placeholder="Minimum 4 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <Button type="submit" fullWidth size="lg" disabled={busy}>
            {busy ? 'Creating account…' : 'Create Free Account'}
          </Button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to={ROUTES.login}>Login</Link>
        </p>
        <p className="demo-hint">Mock auth (Phase 1) — koi bhi details chalegi, koi real data save nahi hota.</p>
      </div>
    </div>
  );
}
