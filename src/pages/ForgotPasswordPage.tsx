import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { authService } from '@/services/authService';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  usePageMeta('Forgot Password — SunoBolo English', 'Apna password reset karein.');
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await authService.forgotPassword(email);
      setSent(true);
      toast('Reset link bhej diya gaya (mock).', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Kuch galat ho gaya.', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Forgot password? 🔑</h1>
        <p>Apna email daalo — hum reset link bhej denge.</p>
        {sent ? (
          <div className="state" style={{ minHeight: 0, padding: 'var(--sp-4) 0' }}>
            <span className="state__emoji" aria-hidden="true">📬</span>
            <h3>Link bhej diya gaya!</h3>
            <p>
              (Phase 1 mock — Phase 2 mein asli email jaayega.) Ab wapas jao aur login karo.
            </p>
            <Button to={ROUTES.login}>Back to Login</Button>
          </div>
        ) : (
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
            <Button type="submit" fullWidth size="lg" disabled={busy}>
              {busy ? 'Sending…' : 'Send Reset Link'}
            </Button>
          </form>
        )}
        <p className="auth-switch">
          <Link to={ROUTES.login}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
