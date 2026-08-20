import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

declare global {
  interface Window {
    google?: { accounts?: { id?: { initialize: (cfg: Record<string, unknown>) => void; prompt: (cb?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void; renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void } } };
    handleGoogleCredential?: (response: { credential: string }) => void;
  }
}

const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';

export default function Login() {
  const { user, loading, login, signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');

  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [gisReady, setGisReady] = useState(false);
  const { forgotPassword, resetPassword } = useAuth();

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  // ── Google One Tap / Sign-In Button ──
  const initGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID || !window.google?.accounts?.id) return;
    window.handleGoogleCredential = async (response: { credential: string }) => {
      setError('');
      setSubmitting(true);
      const result = await loginWithGoogle(response.credential);
      setSubmitting(false);
      if (result.error) {
        setError(result.error);
      } else {
        navigate('/', { replace: true });
      }
    };
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: window.handleGoogleCredential,
      auto_select: true,
      cancel_on_tap_outside: true,
    });
    if (googleBtnRef.current) {
      googleBtnRef.current.innerHTML = '';
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'continue_with',
        shape: 'rectangular',
      });
      setGisReady(true);
    }
  }, [loginWithGoogle, navigate]);

  useEffect(() => {
    // Load Google Identity Services script
    if (document.getElementById('google-gis')) { initGoogle(); return; }
    const script = document.createElement('script');
    script.id = 'google-gis';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setTimeout(initGoogle, 200);
    document.head.appendChild(script);
  }, [initGoogle]);

  // ── Also trigger Google One Tap prompt after short delay ──
  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    const t = setTimeout(() => {
      try { window.google?.accounts?.id?.prompt(); } catch { /* ignore */ }
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  // ── Email/Password Submit ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (mode === 'signup') {
      const result = await signup(name, email, password, phone || undefined);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    } else if (mode === 'login') {
      const result = await login(email, password);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    }

    setSubmitting(false);
    navigate('/', { replace: true });
  };

  // ── Forgot Password: request code ──
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const result = await forgotPassword(email);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setResetEmail(email);
      setMode('reset');
      setSuccess('Reset code generated! (In production this would be emailed)');
    }
  };

  // ── Reset Password: submit new password ──
  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    const result = await resetPassword(resetEmail, resetCode, newPassword);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      setSuccess('Password reset! You can now login with your new password.');
      setMode('login');
      setEmail(resetEmail);
      setPassword('');
      setResetCode('');
      setNewPassword('');
    }
  };

  // ── Google Sign-In button (fallback if GIS doesn't render) ──
  const handleGoogleFallback = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('Google login not configured yet. Add GOOGLE_CLIENT_ID to enable it.');
      return;
    }
    // If GIS button didn't render, try prompt
    try { window.google?.accounts?.id?.prompt(); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl shadow-glow-brand mb-5">
        🎙️
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900">
        {mode === 'forgot' ? 'Reset Password' : mode === 'reset' ? 'New Password' : mode === 'signup' ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
        {mode === 'forgot'
          ? 'Enter your email and we\'ll generate a reset code.'
          : mode === 'reset'
          ? `Code sent to ${resetEmail}`
          : mode === 'signup'
          ? 'Sign up to save progress and unlock all courses.'
          : 'Sign in to continue learning.'}
      </p>

      {/* ══════════ GOOGLE ONE TAP ══════════ */}
      {(mode === 'login' || mode === 'signup') && (
        <div className="mt-6 w-full max-w-sm space-y-3">
          {/* Google GIS rendered button */}
          <div ref={googleBtnRef} className="w-full" />

          {/* Fallback Google button — only show if GIS hasn't rendered yet */}
          {!gisReady && (
            <button
              onClick={handleGoogleFallback}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 rounded-xl border-2 border-gray-200 bg-white text-gray-700 font-semibold text-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[.98] transition-all shadow-sm"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {mode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
            </button>
          )}

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-gray-400 font-medium">or continue with email</span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ FORM ══════════ */}
      <form
        onSubmit={
          mode === 'forgot' ? handleForgot :
          mode === 'reset' ? handleReset :
          handleSubmit
        }
        className="mt-4 w-full max-w-sm space-y-3"
      >
        {mode === 'signup' && (
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        )}

        {(mode === 'login' || mode === 'signup' || mode === 'forgot') && (
          <input
            type="email"
            placeholder="Email address"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        )}

        {mode === 'signup' && (
          <input
            type="tel"
            placeholder="Phone number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        )}

        {(mode === 'login' || mode === 'signup') && (
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
          />
        )}

        {mode === 'reset' && (
          <>
            <input
              type="text"
              placeholder="6-digit reset code"
              required
              maxLength={6}
              pattern="[0-9]{6}"
              value={resetCode}
              onChange={(e) => setResetCode(e.target.value.replace(/\D/g, ''))}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm text-center text-lg tracking-[0.3em] font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
            <input
              type="password"
              placeholder="New password (min 6 characters)"
              required
              minLength={6}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
            />
          </>
        )}

        {/* Error */}
        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>
        )}

        {/* Success */}
        {success && (
          <p className="text-green-600 text-xs text-center bg-green-50 border border-green-100 rounded-lg py-2.5 px-3">{success}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50"
        >
          {submitting
            ? 'Please wait...'
            : mode === 'forgot'
            ? 'Send Reset Code'
            : mode === 'reset'
            ? 'Reset Password'
            : mode === 'signup'
            ? 'Create Account'
            : 'Sign In'}
        </button>
      </form>

      {/* ══════════ LINKS ══════════ */}
      <div className="mt-5 space-y-2 w-full max-w-sm">
        {mode === 'login' && (
          <button
            onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            Forgot password?
          </button>
        )}

        {mode === 'forgot' && (
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            ← Back to Sign In
          </button>
        )}

        {mode === 'reset' && (
          <button
            onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            ← Request new code
          </button>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        )}

        <a href="/free-trial" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-3">
          🎧 Try Free Trial first →
        </a>
        <a href="/" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
