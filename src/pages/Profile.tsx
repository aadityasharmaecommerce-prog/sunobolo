import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLANS, type PlanId } from '../config/plans';

export default function Profile() {
  const { user, subscription, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-gray-400 text-sm">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-100 flex items-center justify-center text-3xl mx-auto">👤</div>
        <h1 className="text-xl font-bold text-gray-900 mt-4">Guest User</h1>
        <p className="text-gray-500 text-sm mt-1">Sign in to save progress and track streaks</p>
        <button onClick={() => navigate('/login')} className="mt-6 btn-premium btn-premium-gradient px-8 py-3 rounded-2xl text-sm">
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const planInfo = subscription.active && subscription.plan_id
    ? PLANS[subscription.plan_id as PlanId]
    : null;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* User info */}
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl mx-auto shadow-glow-brand">
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h1 className="text-xl font-bold text-gray-900 mt-4">{user.name}</h1>
        <p className="text-gray-500 text-sm mt-1">{user.email}</p>
      </div>

      {/* Subscription status */}
      <div className={`card-premium p-5 ${subscription.active ? 'border-success-200 bg-success-50/30' : ''}`}>
        <h2 className="font-bold text-gray-900 mb-3">
          {subscription.active ? '🟢 Active Access' : '🔴 No Active Access'}
        </h2>
        {subscription.active && planInfo ? (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-semibold">{planInfo.name} — ₹{planInfo.amountRupees}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-success-600">Active</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Started</span><span className="font-semibold">{formatDate(subscription.started_at)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className="font-semibold">{formatDate(subscription.expires_at)}</span></div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">Unlock 5,000+ sentences with full app access. One-time payment, no monthly charges.</p>
            <button onClick={() => navigate('/pricing')} className="btn-premium btn-premium-gradient w-full py-3 text-sm rounded-2xl">
              Unlock Full Access →
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card-premium p-5">
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="space-y-2">
          <button onClick={() => navigate('/free-trial')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center text-sm">🎤</span>
            <span className="font-medium text-gray-700 text-sm">Try Free Trial</span>
          </button>
          <button onClick={() => navigate('/courses')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-sm">📚</span>
            <span className="font-medium text-gray-700 text-sm">Browse Courses</span>
          </button>
          {!subscription.active && (
            <button onClick={() => navigate('/pricing')} className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center text-sm">💰</span>
              <span className="font-medium text-gray-700 text-sm">See Pricing</span>
            </button>
          )}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="w-full text-center py-3 text-sm text-red-500 font-semibold hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </div>
  );
}
