import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';
import { ArrowLeft, Headphones, Mail } from 'lucide-react';

export default function Login() {
  const { user, loading, login, signup, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Check if we have a reset token in URL
  const urlToken = searchParams.get('token');

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'reset-email' | 'reset-new'>(
    urlToken ? 'reset-new' : 'login'
  );
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  // Handle reset token from URL
  useEffect(() => {
    if (urlToken && !loading) {
      setMode('reset-new');
    }
  }, [urlToken, loading]);

  // Reset new password (from email link with token)
  const [newPassword, setNewPassword] = useState('');

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-16 h-16 rounded-2xl" />
          <div className="skeleton skeleton-text w-32" />
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('PIN / Password do not match.');
        setSubmitting(false);
        return;
      }
      const result = await signup(name, phone, email, password);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    } else if (mode === 'login') {
      const result = await login(phone, password);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    }
    setSubmitting(false);
    navigate('/', { replace: true });
  };

  // Step 1: User enters email → sends reset link
  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const result = await forgotPassword(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMode('reset-email');
      setSuccess('If an account exists for this email, a password reset link has been sent. Check your inbox.');
    }
  };

  // Step 2: User enters new password (from reset link with token)
  const handleResetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (newPassword !== confirmPassword) {
      setError('PIN / Password do not match.');
      setSubmitting(false);
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      setSubmitting(false);
      return;
    }

    const result = await resetPassword(urlToken!, newPassword);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="mb-5">
        <Logo size={40} showText={false} />
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900">
        {mode === 'forgot' ? 'Reset Password'
          : mode === 'reset-email' ? 'Check Your Email'
          : mode === 'reset-new' ? 'Set New Password'
          : mode === 'signup' ? 'Create Account'
          : 'Welcome to SunoBolo'}
      </h1>
      <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
        {mode === 'forgot'
          ? "Enter your email and we'll send a reset link."
          : mode === 'reset-email'
          ? "We've sent a password reset link to your email."
          : mode === 'reset-new'
          ? "Enter your new password below."
          : mode === 'signup'
          ? 'Create your account to save progress and unlock all courses.'
          : 'Sign in to continue learning.'}
      </p>

      {/* ── Forgot Password Form ── */}
      {mode === 'forgot' && (
        <form onSubmit={handleForgot} className="mt-6 w-full max-w-sm space-y-3">
          <input type="email" placeholder="Email address" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />

          {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}
          {success && <p className="text-success-600 text-xs text-center bg-success-50 border border-success-200 rounded-lg py-2.5 px-3">{success}</p>}

          <button type="submit" disabled={submitting}
            className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
            {submitting ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
      )}

      {/* ── Reset Email Sent Confirmation ── */}
      {mode === 'reset-email' && (
        <div className="mt-6 w-full max-w-sm space-y-4">
          <div className="w-16 h-16 rounded-full bg-success-50 border border-success-200 flex items-center justify-center mx-auto">
            <Mail size={28} className="text-success-600" />
          </div>
          {success && <p className="text-success-600 text-sm text-center">{success}</p>}
          <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Didn't receive? Try again
          </button>
        </div>
      )}

      {/* ── Reset New Password Form ── */}
      {mode === 'reset-new' && (
        <form onSubmit={handleResetNewPassword} className="mt-6 w-full max-w-sm space-y-3">
          <input type="password" placeholder="New password (min 6 characters)" required minLength={6} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="password" placeholder="Confirm new password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />

          {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}
          {success && <p className="text-success-600 text-xs text-center bg-success-50 border border-success-200 rounded-lg py-2.5 px-3">{success}</p>}

          <button type="submit" disabled={submitting}
            className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
            {submitting ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}

      {/* ── Login Form ── */}
      {mode === 'login' && (
        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-3">
          <input type="tel" placeholder="Mobile Number" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="password" placeholder="PIN / Password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />

          {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}
          {success && <p className="text-success-600 text-xs text-center bg-success-50 border border-success-200 rounded-lg py-2.5 px-3">{success}</p>}

          <button type="submit" disabled={submitting}
            className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
            {submitting ? 'Please wait...' : 'Login'}
          </button>
        </form>
      )}

      {/* ── Signup Form ── */}
      {mode === 'signup' && (
        <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-3">
          <input type="text" placeholder="Name" required value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="tel" placeholder="Mobile Number" required value={phone} onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="email" placeholder="Email Address (for recovery)" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="password" placeholder="Create PIN / Password (min 6)" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />
          <input type="password" placeholder="Confirm PIN / Password" required minLength={6} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors" />

          {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}
          {success && <p className="text-success-600 text-xs text-center bg-success-50 border border-success-200 rounded-lg py-2.5 px-3">{success}</p>}

          <button type="submit" disabled={submitting}
            className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
            {submitting ? 'Please wait...' : 'Create Account'}
          </button>
        </form>
      )}

      {/* ── Links ── */}
      <div className="mt-5 space-y-2 w-full max-w-sm">
        {mode === 'login' && (
          <button onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors">
            Forgot PIN / Password?
          </button>
        )}
        {mode === 'forgot' && (
          <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center justify-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Sign In
          </button>
        )}
        {mode === 'reset-email' && (
          <button onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center justify-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Sign In
          </button>
        )}
        {mode === 'reset-new' && (
          <button onClick={() => { navigate('/login', { replace: true }); }}
            className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center justify-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Sign In
          </button>
        )}
        {(mode === 'login' || mode === 'signup') && (
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); setName(''); setPhone(''); setEmail(''); setPassword(''); setConfirmPassword(''); }}
            className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors">
            {mode === 'login' ? "New to SunoBolo? Create Account" : 'Already have an account? Sign In'}
          </button>
        )}
        <a href="/free-trial" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors mt-3 inline-flex items-center justify-center gap-1">
          <Headphones size={12} strokeWidth={2} /> Try Free Trial first
        </a>
        <a href="/" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Back to Home
        </a>
      </div>
    </div>
  );
}
