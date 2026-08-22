import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import Logo from '../components/Logo';
import { ArrowLeft, Headphones, Mail, Phone, Lock, User, Check } from 'lucide-react';

type FlowStep = 'mobile' | 'pin' | 'create-pin' | 'forgot' | 'reset-email' | 'reset-new' | 'name-onboard';

export default function Login() {
  const { user, loading, checkMobile, login, signup, forgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlToken = searchParams.get('token');

  const [step, setStep] = useState<FlowStep>(urlToken ? 'reset-new' : 'mobile');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingUserName, setExistingUserName] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  // Handle reset token from URL
  useEffect(() => {
    if (urlToken && !loading) setStep('reset-new');
  }, [urlToken, loading]);

  // Reset new password state
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

  // ── Step 1: Mobile Number ──
  const handleMobileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await checkMobile(phone);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    if (result.exists) {
      // Existing user → go to PIN entry
      setExistingUserName(result.name || '');
      setStep('pin');
    } else {
      // New user → go to create PIN
      setStep('create-pin');
    }
  };

  // ── Step 2a: PIN Login (existing user) ──
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const result = await login(phone, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    navigate('/', { replace: true });
  };

  // ── Step 2b: Create PIN (new user) ──
  const handleCreatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('PIN / Password do not match.');
      return;
    }
    if (password.length < 6) {
      setError('PIN must be at least 6 characters.');
      return;
    }

    setSubmitting(true);
    // Create account with phone + PIN (name collected later)
    const result = await signup('', phone, email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Account created — ask for name
    setStep('name-onboard');
  };

  // ── Step 3: Name Onboarding (after account creation) ──
  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Save name if provided, then go home
    if (name.trim()) {
      try {
        await fetch('/api/auth/update-name', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ name: name.trim() }),
        });
      } catch { /* ignore — name can be updated later in profile */ }
    }
    navigate('/', { replace: true });
  };

  // ── Forgot Password ──
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
      setStep('reset-email');
      setSuccess('If an account exists for this email, a password reset link has been sent. Check your inbox.');
    }
  };

  // ── Reset New Password ──
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
        setStep('mobile');
        setError('');
        setSuccess('');
        setNewPassword('');
        setConfirmPassword('');
        setEmail('');
      }, 2000);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      {/* Logo */}
      <div className="mb-5">
        <Logo size={40} showText={false} />
      </div>

      {/* ── Step 1: Mobile Number ── */}
      {step === 'mobile' && (
        <>
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
            <Phone size={24} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Apna Mobile Number Enter Karein</h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
            System automatically detect karega — existing account ya naya account.
          </p>

          <form onSubmit={handleMobileSubmit} className="mt-6 w-full max-w-sm space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">+91</span>
              <input
                type="tel"
                placeholder="Mobile Number"
                required
                value={phone}
                onChange={(e) => {
                  // Strip everything except digits, max 10
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setPhone(digits);
                }}
                maxLength={12}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
              />
            </div>

            {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}

            <button type="submit" disabled={submitting || phone.length < 10}
              className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
              {submitting ? 'Checking...' : 'Continue →'}
            </button>
          </form>
        </>
      )}

      {/* ── Step 2a: PIN Login (existing user) ── */}
      {step === 'pin' && (
        <>
          <div className="w-14 h-14 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-4">
            <Lock size={24} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Welcome Back{existingUserName ? `, ${existingUserName}` : ''}!</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Mobile: <span className="font-semibold text-gray-700">+91 {phone}</span>
          </p>

          <form onSubmit={handlePinLogin} className="mt-6 w-full max-w-sm space-y-3">
            <input
              type="password"
              placeholder="Enter PIN / Password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
            />

            {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
              {submitting ? 'Please wait...' : 'Login'}
            </button>
          </form>

          <div className="mt-4 space-y-2 w-full max-w-sm">
            <button onClick={() => { setStep('forgot'); setError(''); setSuccess(''); setPassword(''); }}
              className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors">
              Forgot PIN / Password?
            </button>
            <button onClick={() => { setStep('mobile'); setError(''); setPassword(''); setPhone(''); }}
              className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors inline-flex items-center justify-center gap-1">
              <ArrowLeft size={14} strokeWidth={2} /> Change mobile number
            </button>
          </div>
        </>
      )}

      {/* ── Step 2b: Create PIN (new user) ── */}
      {step === 'create-pin' && (
        <>
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-center mb-4">
            <User size={24} className="text-brand-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Your Account</h1>
          <p className="text-gray-500 text-sm mt-1.5">
            Mobile: <span className="font-semibold text-gray-700">+91 {phone}</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">Naya account ban raha hai — PIN create karein</p>

          <form onSubmit={handleCreatePin} className="mt-6 w-full max-w-sm space-y-3">
            <input
              type="password"
              placeholder="Create PIN / Password (min 6)"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
            />
            <input
              type="password"
              placeholder="Confirm PIN / Password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
            />
            <input
              type="email"
              placeholder="Email (optional, for recovery)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
            />

            {error && <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2.5 px-3">{error}</p>}

            <button type="submit" disabled={submitting}
              className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50">
              {submitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <button onClick={() => { setStep('mobile'); setError(''); setPassword(''); setConfirmPassword(''); setEmail(''); }}
            className="mt-4 text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Change mobile number
          </button>
        </>
      )}

      {/* ── Step 3: Name Onboarding (after account creation) ── */}
      {step === 'name-onboard' && (
        <>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-3xl shadow-glow-success mb-4">
            <Check size={32} strokeWidth={3} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Account Ban Gaya! 🎉</h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
            Aapka account successfully create ho gaya. Ab aap free trial try kar sakte hain!
          </p>

          <form onSubmit={handleNameSubmit} className="mt-6 w-full max-w-sm space-y-3">
            <input
              type="text"
              placeholder="Apna naam (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-surface-50 focus:bg-white transition-colors"
            />
            <button type="submit"
              className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl">
              Start Learning →
            </button>
            <button type="button" onClick={() => navigate('/', { replace: true })}
              className="w-full text-center text-sm text-gray-500 font-medium hover:text-gray-700 transition-colors">
              Skip for now
            </button>
          </form>
        </>
      )}

      {/* ── Forgot Password Form ── */}
      {step === 'forgot' && (
        <>
          <h1 className="text-2xl font-extrabold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
            Enter your recovery email and we'll send a reset link.
          </p>
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
          <button onClick={() => { setStep('pin'); setError(''); setSuccess(''); setEmail(''); }}
            className="mt-4 text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Login
          </button>
        </>
      )}

      {/* ── Reset Email Sent Confirmation ── */}
      {step === 'reset-email' && (
        <>
          <div className="w-16 h-16 rounded-full bg-success-50 border border-success-200 flex items-center justify-center mx-auto mb-4">
            <Mail size={28} className="text-success-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Check Your Email</h1>
          {success && <p className="text-success-600 text-sm text-center mt-2">{success}</p>}
          <button onClick={() => { setStep('forgot'); setError(''); setSuccess(''); }}
            className="mt-4 text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Login
          </button>
        </>
      )}

      {/* ── Reset New Password Form ── */}
      {step === 'reset-new' && (
        <>
          <h1 className="text-2xl font-extrabold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1.5 max-w-xs">Enter your new password below.</p>
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
          <button onClick={() => { setStep('mobile'); setError(''); setSuccess(''); setNewPassword(''); setConfirmPassword(''); }}
            className="mt-4 text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors inline-flex items-center gap-1">
            <ArrowLeft size={14} strokeWidth={2} /> Back to Login
          </button>
        </>
      )}

      {/* ── Footer Links ── */}
      {step === 'mobile' && (
        <div className="mt-5 space-y-2 w-full max-w-sm">
          <a href="/free-trial" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors inline-flex items-center justify-center gap-1">
            <Headphones size={12} strokeWidth={2} /> Try Free Trial first
          </a>
          <a href="/" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to Home
          </a>
        </div>
      )}
    </div>
  );
}
