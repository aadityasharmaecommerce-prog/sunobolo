import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLANS, type PlanId } from '../config/plans';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { subscription, refreshAuth } = useAuth();
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verify = async () => {
      const orderId = searchParams.get('razorpay_order_id');
      const paymentId = searchParams.get('razorpay_payment_id');
      const signature = searchParams.get('razorpay_signature');

      if (!orderId || !paymentId || !signature) {
        setVerifying(false);
        return;
      }

      try {
        const res = await fetch('/api/payment/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            razorpay_order_id: orderId,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          }),
        });
        const data = await res.json();
        if (data.verified) {
          await refreshAuth();
        }
      } catch {
        // Payment verification failed
      }
      setVerifying(false);
    };
    verify();
  }, [searchParams, refreshAuth]);

  const planInfo = subscription.active && subscription.plan_id
    ? PLANS[subscription.plan_id as PlanId]
    : null;

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (verifying) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <div className="text-gray-400 text-sm">Verifying payment...</div>
      </div>
    );
  }

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
        <div className="mt-6 w-full max-w-xs card p-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Plan</span><span className="font-semibold">{planInfo.name}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-semibold">₹{planInfo.amountRupees}</span></div>
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
