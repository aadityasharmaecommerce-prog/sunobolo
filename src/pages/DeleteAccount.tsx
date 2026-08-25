import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function DeleteAccount() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !password) return;

    if (!window.confirm('Are you absolutely sure? This will permanently delete your account and ALL data. This cannot be undone.')) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/auth/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.ok) {
        setResult({ type: 'success', msg: 'Your account and all data have been permanently deleted.' });
        // Clear local storage and redirect
        localStorage.clear();
        sessionStorage.clear();
        setTimeout(() => navigate('/'), 3000);
      } else {
        setResult({ type: 'error', msg: data.error || 'Failed to delete account.' });
      }
    } catch {
      setResult({ type: 'error', msg: 'Network error. Please try again.' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">🗑️ Delete Your Account</h1>
        <p className="text-gray-500 text-sm mb-6">Permanently delete your SunoBolo English account and all associated data.</p>

        <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4 mb-6 text-sm text-yellow-800 leading-relaxed">
          <strong className="block mb-1">⚠️ This action is permanent and cannot be undone.</strong>
          All your progress, subscription data, and personal information will be permanently erased.
        </div>

        <form onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Mobile Number</label>
          <input
            type="tel"
            placeholder="e.g. 9876543210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={15}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base mb-4 focus:outline-none focus:border-purple-500 transition"
            required
          />

          <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-base mb-6 focus:outline-none focus:border-purple-500 transition"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-base transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? 'Deleting...' : 'Delete My Account & Data'}
          </button>
        </form>

        {result && (
          <div className={`mt-4 p-4 rounded-xl text-sm leading-relaxed ${
            result.type === 'success'
              ? 'bg-green-50 border border-green-300 text-green-800'
              : 'bg-red-50 border border-red-300 text-red-800'
          }`}>
            {result.type === 'success' ? '✅ ' : ''}{result.msg}
          </div>
        )}
      </div>
    </div>
  );
}
