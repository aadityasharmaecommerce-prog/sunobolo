import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLANS, type PlanId } from '../config/plans';
import { User, Mic, BookOpen, CreditCard, LogOut, ChevronRight, Calendar, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const { user, subscription, logout, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="skeleton w-16 h-16 rounded-full" />
          <div className="skeleton skeleton-text w-32" />
          <div className="skeleton skeleton-text-sm w-24" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center mx-auto">
          <User size={32} className="text-brand-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 mt-4">Guest User</h1>
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

  // Format phone for display: +91XXXXXXXXXX → +91 XXXXX XXXXX
  const formatPhone = (phone?: string) => {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
    }
    return phone;
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* User info */}
      <div className="text-center py-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white flex items-center justify-center text-3xl mx-auto shadow-glow-brand font-extrabold">
          {user.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <h1 className="text-xl font-extrabold text-gray-900 mt-4">{user.name}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {user.phone ? formatPhone(user.phone) : user.email}
        </p>
      </div>

      {/* Subscription status */}
      <div className={`card-premium p-5 ${subscription.active ? 'border-success-200 bg-success-50/30' : ''}`}>
        <h2 className="font-bold text-gray-900 mb-3 inline-flex items-center gap-2">
          {subscription.active ? (
            <>
              <span className="w-2 h-2 rounded-full bg-success-500" />
              Active Access
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-gray-300" />
              No Active Access
            </>
          )}
        </h2>
        {subscription.active && planInfo ? (
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 inline-flex items-center gap-1.5">
                <BookOpen size={13} strokeWidth={2} />
                Plan
              </span>
              <span className="font-semibold">{planInfo.name} — ₹{planInfo.amountRupees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={2} />
                Status
              </span>
              <span className="font-semibold text-success-600">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={2} />
                Started
              </span>
              <span className="font-semibold">{formatDate(subscription.started_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={2} />
                Expires
              </span>
              <span className="font-semibold">{formatDate(subscription.expires_at)}</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">Unlock 5,000+ sentences with full app access. One-time payment, no monthly charges.</p>
            <button onClick={() => navigate('/pricing')} className="btn-premium btn-premium-gradient w-full py-3 text-sm rounded-2xl">
              Unlock Full Access
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card-premium p-5">
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="space-y-1">
          {[
            { Icon: Mic, label: 'Try Free Trial', path: '/free-trial', color: 'bg-brand-50 text-brand-600' },
            { Icon: BookOpen, label: 'Browse Courses', path: '/courses', color: 'bg-accent-50 text-accent-600' },
            ...(!subscription.active ? [{ Icon: CreditCard, label: 'See Pricing', path: '/pricing', color: 'bg-success-50 text-success-600' }] : []),
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="w-full text-left p-3 rounded-xl hover:bg-surface-50 transition-colors flex items-center gap-3 group"
            >
              <span className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.Icon size={16} strokeWidth={2} />
              </span>
              <span className="font-medium text-gray-700 text-sm flex-1">{action.label}</span>
              <ChevronRight size={14} className="text-gray-300 group-hover:text-gray-500 transition-colors" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="w-full text-center py-3 text-sm text-red-500 font-semibold hover:text-red-600 transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <LogOut size={14} strokeWidth={2} />
        Logout
      </button>
    </div>
  );
}
