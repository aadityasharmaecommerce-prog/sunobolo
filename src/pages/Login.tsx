import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export default function Login() {
  const { user, loading, login, signup } = useAuth();
  const navigate = useNavigate();

  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true });
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    if (isSignup) {
      const result = await signup(name, email, password, phone || undefined);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    } else {
      const result = await login(email, password);
      if (result.error) { setError(result.error); setSubmitting(false); return; }
    }

    setSubmitting(false);
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl shadow-glow-brand mb-5">
        🎙️
      </div>

      <h1 className="text-2xl font-extrabold text-gray-900">
        {isSignup ? 'Create Account' : 'Welcome Back'}
      </h1>
      <p className="text-gray-500 text-sm mt-1.5 max-w-xs">
        {isSignup
          ? 'Sign up to save progress and unlock all courses.'
          : 'Sign in to continue learning.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 w-full max-w-sm space-y-3">
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        )}

        <input
          type="email"
          placeholder="Email address"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />

        {isSignup && (
          <input
            type="tel"
            placeholder="Phone number (optional)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
          />
        )}

        <input
          type="password"
          placeholder="Password (min 6 characters)"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
        />

        {error && (
          <p className="text-red-500 text-xs text-center bg-red-50 border border-red-100 rounded-lg py-2 px-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full btn-premium btn-premium-gradient py-3.5 text-sm font-bold rounded-xl disabled:opacity-50"
        >
          {submitting ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      <div className="mt-4 space-y-2 w-full max-w-sm">
        <button
          onClick={() => { setIsSignup(!isSignup); setError(''); }}
          className="w-full text-center text-sm text-brand-600 font-semibold hover:text-brand-700 transition-colors"
        >
          {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </button>
        <a href="/free-trial" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          Try Free Trial first →
        </a>
        <a href="/" className="block w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to Home
        </a>
      </div>
    </div>
  );
}
