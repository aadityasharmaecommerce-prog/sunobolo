import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLANS, type PlanId } from '../config/plans';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, activateSubscription, refreshAuth } = useAuth();
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    // Activate subscription from URL param
    const planId = searchParams.get('plan');
    if (planId && !activated) {
      activateSubscription(planId);
      setActivated(true);
    }
    refreshAuth();
  }, [searchParams, activateSubscription, refreshAuth, activated]);

  const planInfo = subscription.active && subscription.plan_id
    ? PLANS[subscription.plan_id as PlanId]
    : null;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-success-400 to-emerald-600 text-white flex items-center justify-center text-4xl shadow-glow-success mb-6">
        🎉
      </div>
      <h1 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h1>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Welcome to SunoBolo English. Your full access is now active.
      </p>

      {planInfo && (
        <div className="mt-6 w-full max-w-xs card-premium p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-semibold">{planInfo.name} — ₹{planInfo.amountRupees}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="font-semibold text-success-600">Active</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Expires</span><span className="font-semibold">{formatDate(subscription.expires_at)}</span></div>
        </div>
      )}

      <button
        onClick={() => navigate('/courses')}
        className="mt-8 btn-premium btn-premium-gradient px-8 py-4 text-base rounded-2xl"
      >
        Start Learning →
      </button>
    </div>
  );
}
