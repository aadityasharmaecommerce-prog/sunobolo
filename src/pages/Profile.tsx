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
          <div className="dark-skeleton w-16 h-16 rounded-full" />
          <div className="dark-skeleton h-4 w-32 rounded" />
          <div className="dark-skeleton h-3 w-24 rounded" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-500/15 border border-brand-500/25 flex items-center justify-center mx-auto">
          <User size={32} className="text-brand-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-xl font-extrabold text-white mt-4">Guest User</h1>
        <p className="text-white/45 text-sm mt-1">Sign in to save progress and track streaks</p>
        <button onClick={() => navigate('/login')} className="mt-6 btn-premium btn-premium-gradient px-8 py-3 rounded-xl text-sm">
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
        <h1 className="text-xl font-extrabold text-white mt-4">{user.name}</h1>
        <p className="text-white/45 text-sm mt-1">
          {user.phone ? formatPhone(user.phone) : user.email}
        </p>
      </div>

      {/* Subscription status */}
      <div className={`dark-card p-5 ${subscription.active ? 'border-emerald-500/20' : ''}`}>
        <h2 className="font-bold text-white mb-3 inline-flex items-center gap-2">
          {subscription.active ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Active Access
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-white/25" />
              No Active Access
            </>
          )}
        </h2>
        {subscription.active && planInfo ? (
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-white/45 inline-flex items-center gap-1.5">
                <BookOpen size={13} strokeWidth={2} />
                Plan
              </span>
              <span className="font-semibold text-white">{planInfo.name} — ₹{planInfo.amountRupees}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/45 inline-flex items-center gap-1.5">
                <CheckCircle2 size={13} strokeWidth={2} />
                Status
              </span>
              <span className="font-semibold text-emerald-400">Active</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/45 inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={2} />
                Started
              </span>
              <span className="font-semibold text-white">{formatDate(subscription.started_at)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/45 inline-flex items-center gap-1.5">
                <Calendar size={13} strokeWidth={2} />
                Expires
              </span>
              <span className="font-semibold text-white">{formatDate(subscription.expires_at)}</span>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm text-white/45 mb-3">Unlock 5,000+ sentences with full app access. One-time payment, no monthly charges.</p>
            <button onClick={() => navigate('/pricing')} className="btn-premium btn-premium-gradient w-full py-3 text-sm rounded-xl">
              Unlock Full Access
              <ChevronRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="dark-card p-5">
        <h2 className="font-bold text-white mb-3">Quick Actions</h2>
        <div className="space-y-1">
          {[
            { Icon: Mic, label: 'Try Free Trial', path: '/free-trial', color: 'bg-brand-500/15 text-brand-400' },
            { Icon: BookOpen, label: 'Browse Courses', path: '/courses', color: 'bg-accent-500/15 text-accent-400' },
            ...(!subscription.active ? [{ Icon: CreditCard, label: 'See Pricing', path: '/pricing', color: 'bg-emerald-500/15 text-emerald-400' }] : []),
          ].map(action => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-3 group"
            >
              <span className={`w-9 h-9 rounded-lg ${action.color} flex items-center justify-center`}>
                <action.Icon size={16} strokeWidth={2} />
              </span>
              <span className="font-medium text-white/70 text-sm flex-1">{action.label}</span>
              <ChevronRight size={14} className="text-white/20 group-hover:text-white/40 transition-colors" strokeWidth={2} />
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); }}
        className="w-full text-center py-3 text-sm text-red-400 font-semibold hover:text-red-300 transition-colors inline-flex items-center justify-center gap-1.5"
      >
        <LogOut size={14} strokeWidth={2} />
        Logout
      </button>
    </div>
  );
}
