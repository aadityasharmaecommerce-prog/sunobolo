import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useRazorpay } from '../hooks/useRazorpay';
import { PLAN_LIST, type Plan } from '../config/plans';
import { ArrowLeft, Sparkles, Shield, Zap, CreditCard, Users, CheckCircle2, Tag, X } from 'lucide-react';

/**
 * Plan duration ranking for upgrade/downgrade comparison.
 * Higher value = longer plan.
 */
const PLAN_RANK: Record<string, number> = {
  three_month: 3,
  six_month: 6,
  one_year: 12,
};

type PlanCardState =
  | { type: 'loading' }
  | { type: 'no-subscription' }
  | { type: 'current'; expiresAt: string }
  | { type: 'upgrade'; expiresAt: string }
  | { type: 'already-included'; expiresAt: string };

function getPlanCardState(
  plan: Plan,
  subscription: { active: boolean; plan_id?: string; expires_at?: string } | null,
): PlanCardState {
  if (!subscription) return { type: 'no-subscription' };

  const activeRank = subscription.plan_id ? PLAN_RANK[subscription.plan_id] : 0;
  const thisRank = PLAN_RANK[plan.id] || 0;

  if (subscription.active && subscription.plan_id === plan.id) {
    // Same plan — this is the current plan
    return { type: 'current', expiresAt: subscription.expires_at || '' };
  }

  if (subscription.active && thisRank < activeRank) {
    // Shorter plan than active — already included
    return { type: 'already-included', expiresAt: subscription.expires_at || '' };
  }

  if (subscription.active && thisRank > activeRank) {
    // Longer plan than active — upgrade
    return { type: 'upgrade', expiresAt: subscription.expires_at || '' };
  }

  // Not active or expired — show normal purchase
  return { type: 'no-subscription' };
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription, loading: authLoading } = useAuth();
  const { checkout, loading, error, clearCoupon } = useRazorpay();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDetails, setCouponDetails] = useState<{ discountType: string; discountValue: number; applicablePlans: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Check if a plan is applicable for the applied coupon
  const isPlanApplicable = (planId: string): boolean => {
    if (!couponDetails) return false;
    if (couponDetails.applicablePlans === 'all') return true;
    const allowed = couponDetails.applicablePlans.split(',').map(s => s.trim());
    return allowed.includes(planId);
  };

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) { setCouponError('Please enter a coupon code'); return; }
    setCouponError('');
    setValidatingCoupon(true);

    try {
      // Validate against ALL plans in parallel to determine which are applicable
      const results = await Promise.all(
        PLAN_LIST.map(async (plan) => {
          const res = await fetch('/api/coupon/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ code: couponInput.trim(), planId: plan.id }),
          });
          const data = await res.json();
          return { planId: plan.id, result: data };
        })
      );

      // Find the first valid result to get coupon details
      const firstValid = results.find(r => r.result.valid);

      if (firstValid) {
        const d = firstValid.result;
        setCouponCode(d.couponCode);
        setCouponDetails({
          discountType: d.discountType,
          discountValue: d.discountValue,
          applicablePlans: d.applicablePlans || 'all',
        });
      } else {
        // All plans failed — show the error from the first one
        setCouponError(results[0]?.result?.error || 'Invalid coupon code');
        setCouponCode(null);
        setCouponDetails(null);
      }
    } catch {
      setCouponError('Network error validating coupon');
      setCouponCode(null);
      setCouponDetails(null);
    }
    setValidatingCoupon(false);
  };

  const handleClearCoupon = () => {
    clearCoupon();
    setCouponInput('');
    setCouponError('');
    setCouponCode(null);
    setCouponDetails(null);
  };

  const getDisplayPrice = (plan: Plan) => {
    if (couponCode && couponDetails && isPlanApplicable(plan.id)) {
      let discountPaise = 0;
      if (couponDetails.discountType === 'percentage') {
        discountPaise = Math.floor(plan.amount * couponDetails.discountValue / 100);
      } else {
        discountPaise = Math.min(couponDetails.discountValue, plan.amount);
      }
      discountPaise = Math.min(discountPaise, plan.amount - 100);
      discountPaise = Math.max(discountPaise, 0);
      const finalPaise = plan.amount - discountPaise;
      return { original: plan.amountRupees, discount: discountPaise / 100, final: finalPaise / 100, applicable: true };
    }
    return { original: plan.amountRupees, discount: 0, final: plan.amountRupees, applicable: false };
  };

  const handleSelect = async (plan: Plan) => {
    if (!user) { navigate('/login'); return; }
    const appliedCode = couponCode && isPlanApplicable(plan.id) ? couponCode : undefined;
    const success = await checkout(plan.id, plan.name, plan.amountRupees, appliedCode);
    if (success) { navigate(`/payment/success?plan=${plan.id}`); }
  };

  // Show skeleton while auth/subscription is loading
  const isLoading = authLoading;

  return (
    <div className="space-y-8 animate-fade-in">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white font-medium transition-colors">
        <ArrowLeft size={16} strokeWidth={2.5} /> Back
      </button>

      <div className="text-center pt-2">
        <p className="dark-kicker">Simple & honest pricing</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Ek Baar Pay Karo. English Improve Karte Raho.</h1>
        <p className="text-white/35 text-sm mt-1.5">One-time payment · No auto-renewal · Full app access</p>
        <div className="inline-flex items-center gap-2 mt-3 text-[12px] font-bold text-white/45 bg-white/[0.04] border border-white/[0.06] rounded-full px-4 py-2">
          <span className="text-amber-400">★★★★★</span> 4.9 · 10,000+ learners trust SunoBolo
        </div>
      </div>

      {/* Active subscription banner */}
      {subscription.active && subscription.plan_id && (
        <div className="dark-card p-5 text-center border-emerald-500/15">
          <p className="text-sm font-bold text-emerald-300">🟢 You have active access!</p>
          <p className="text-xs text-white/35 mt-1">
            Your plan is active until {formatDate(subscription.expires_at || '')}. No need to purchase again.
          </p>
        </div>
      )}

      <div className="grid gap-4">
        {isLoading ? (
          // Skeleton loading state for plan cards
          PLAN_LIST.map((plan) => (
            <div key={plan.id} className="dark-card relative p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="h-5 w-20 bg-white/10 rounded mb-2" />
                  <div className="h-3 w-40 bg-white/5 rounded" />
                </div>
                <div className="text-right">
                  <div className="h-8 w-20 bg-white/10 rounded ml-auto mb-2" />
                  <div className="h-3 w-14 bg-white/5 rounded ml-auto" />
                </div>
              </div>
              <div className="space-y-2.5 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-white/5 rounded" />
                ))}
              </div>
              <div className="h-12 bg-white/5 rounded-xl" />
            </div>
          ))
        ) : (
          PLAN_LIST.map((plan) => {
            const state = getPlanCardState(plan, subscription);
            const isPopular = plan.id === 'one_year';

            return (
              <div key={plan.id} className={`dark-card relative p-6 ${
                isPopular ? '!border-[#6C4DFF]/30 shadow-[0_0_0_1px_rgba(108,77,255,0.15),0_12px_40px_-12px_rgba(108,77,255,0.25)]' : ''
              }`}>
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C4DFF] to-accent-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles size={11} strokeWidth={2.5} /> BEST VALUE
                  </div>
                )}
                {(() => {
                  const dp = getDisplayPrice(plan);
                  return (
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="font-extrabold text-white text-lg">{plan.name}</h2>
                        <p className="text-[13px] text-white/35 mt-0.5">One-time payment · No auto-renewal</p>
                        {couponCode && couponDetails && !dp.applicable && (
                          <span className="text-[10px] text-white/25 mt-1 inline-block">Coupon not applicable</span>
                        )}
                      </div>
                      <div className="text-right">
                        {dp.discount > 0 ? (
                          <div className="space-y-0.5">
                            <span className="text-lg text-white/30 line-through">₹{dp.original}</span>
                            <span className="block text-3xl font-extrabold text-emerald-400">₹{dp.final}</span>
                          </div>
                        ) : (
                          <span className="text-3xl font-extrabold text-white">₹{plan.amountRupees}</span>
                        )}
                        <p className="text-[11px] text-white/25 font-semibold uppercase tracking-wide mt-1">{plan.durationLabel}</p>
                      </div>
                    </div>
                  );
                })()}
                <ul className="space-y-2.5 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/55">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* ── Plan state button ── */}
                {state.type === 'current' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2 py-3 text-sm font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                      ✓ CURRENT PLAN
                    </div>
                    <p className="text-center text-[12px] text-white/35">
                      Active until {formatDate(state.expiresAt)}
                    </p>
                    <button disabled
                      className="w-full py-3.5 text-sm font-bold rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/40 cursor-not-allowed">
                      Current Plan
                    </button>
                  </div>
                )}

                {state.type === 'upgrade' && (
                  <div className="space-y-2">
                    <p className="text-center text-[12px] text-amber-300/80 font-semibold">
                      ↑ Upgrade from current plan
                    </p>
                    <button onClick={() => handleSelect(plan)} disabled={loading}
                      className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                        isPopular ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {loading ? 'Processing...' : (() => { const dp = getDisplayPrice(plan); return dp.discount > 0 ? `Upgrade to ${plan.durationLabel} — ₹${dp.final}` : `Upgrade to ${plan.durationLabel} — ₹${plan.amountRupees}`; })()}
                    </button>
                  </div>
                )}

                {state.type === 'already-included' && (
                  <div className="space-y-2">
                    <p className="text-center text-[12px] text-white/30 font-semibold">
                      Already included in your current plan
                    </p>
                    <button disabled
                      className="w-full py-3.5 text-sm font-bold rounded-xl bg-white/[0.04] border border-white/[0.08] text-white/30 cursor-not-allowed">
                      Current access is longer
                    </button>
                  </div>
                )}

                {state.type === 'no-subscription' && (
                  <button onClick={() => handleSelect(plan)} disabled={loading}
                    className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                      isPopular ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>                    {loading ? 'Processing...' : (() => { const dp = getDisplayPrice(plan); return dp.discount > 0 ? `Get ${plan.durationLabel} — ₹${dp.final}` : `Get ${plan.durationLabel} — ₹${plan.amountRupees}`; })()}
                    </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Coupon Input */}
      <div className="dark-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Tag size={16} className="text-brand-400" />
          <h3 className="text-sm font-bold text-white">Have a coupon?</h3>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={couponInput}
            onChange={(e) => { setCouponInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')); setCouponError(''); }}
            placeholder="Enter coupon code"
            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-mono placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/30"
            maxLength={20}
          />
          {couponCode ? (
            <button onClick={handleClearCoupon}
              className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition-colors inline-flex items-center gap-1.5">
              <X size={14} /> Remove
            </button>
          ) : (
            <button onClick={handleApplyCoupon} disabled={validatingCoupon || !couponInput.trim()}
              className="px-5 py-3 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-bold hover:bg-brand-500/30 transition-colors disabled:opacity-40">
              {validatingCoupon ? 'Checking...' : 'Apply'}
            </button>
          )}
        </div>
        {couponCode && couponDetails && (
          <div className="mt-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
            <p className="text-xs font-bold text-emerald-300">
              ✓ Coupon &ldquo;{couponCode}&rdquo; applied!
            </p>
            <div className="text-[11px] text-white/40">
              Discount shown on applicable plans above.
              {couponDetails.applicablePlans !== 'all' && (
                <span className="text-brand-300 ml-1">
                  Valid for: {couponDetails.applicablePlans.split(',').map(s => {
                    const names: Record<string, string> = { three_month: '3 Months', six_month: '6 Months', one_year: '1 Year' }; return names[s.trim()] || s.trim();
                  }).join(', ')}
                </span>
              )}
            </div>
          </div>
        )}
        {couponError && (
          <p className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{couponError}</p>
        )}
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { Icon: Shield, t: 'Secure Payment', d: 'UPI · Cards · NetBanking' },
          { Icon: Zap, t: 'Instant Access', d: 'Payment ke turant baad' },
          { Icon: CreditCard, t: 'Pay Once', d: 'No hidden fees' },
          { Icon: Users, t: '10,000+ Learners', d: 'Trust SunoBolo' },
        ].map(x => (
          <div key={x.t} className="dark-card-flat !rounded-xl px-3 py-3.5 text-center">
            <x.Icon size={18} className="text-white/35 mx-auto mb-1.5" strokeWidth={2} />
            <p className="text-[12px] font-bold text-white leading-tight">{x.t}</p>
            <p className="text-[10px] text-white/25 mt-0.5">{x.d}</p>
          </div>
        ))}
      </div>

      {/* Free trial CTA */}
      <div className="relative overflow-hidden rounded-3xl p-8 text-center"
        style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4338ca 40%, #6366f1 70%, #7C3AED 100%)' }}>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-[40px] pointer-events-none" />
        <h3 className="text-xl font-extrabold relative text-white">Still not sure?</h3>
        <p className="text-white/70 text-sm mt-1.5 relative">Try 25 sentences absolutely free — no login, no payment.</p>
        <button onClick={() => navigate('/free-trial')}
          className="btn-premium px-8 py-3.5 mt-4 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.15)] hover:bg-gray-50 relative">
          Start Free Trial →
        </button>
      </div>

      {error && (
        <div className="bg-red-500/8 border border-red-500/15 rounded-xl p-4 text-center">
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-xs text-red-400 underline">Try again</button>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
