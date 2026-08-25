import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useRazorpay } from '../hooks/useRazorpay';
import { useGoogleBilling, GOOGLE_PRODUCT_IDS, type GoogleProductId } from '../hooks/useGoogleBilling';
import { PLAN_LIST, type Plan } from '../config/plans';
import { ArrowLeft, Shield, Zap, CreditCard, Users, CheckCircle2, Tag, X, Flame } from 'lucide-react';

/**
 * Plan duration ranking for upgrade/downgrade comparison.
 * Higher value = longer plan.
 */
const PLAN_RANK: Record<string, number> = {
  one_month: 1,
  three_month: 3,
  six_month: 6,
  one_year: 12,
};

/** Active offer from the backend */
interface ActiveOffer {
  id: string;
  name: string;
  label: string;
  plan_id: string;
  mrp: number;           // in paise
  discountPercent: number;
  salePrice: number;      // in paise
  startAt: string;
  endAt: string;
}

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
    return { type: 'current', expiresAt: subscription.expires_at || '' };
  }

  if (subscription.active && thisRank < activeRank) {
    return { type: 'already-included', expiresAt: subscription.expires_at || '' };
  }

  if (subscription.active && thisRank > activeRank) {
    return { type: 'upgrade', expiresAt: subscription.expires_at || '' };
  }

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

function formatExpiryShort(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return '';
  }
}

// ══════════ CHECKOUT MODAL ══════════
function CheckoutModal({
  plan, offer,
  couponInput, setCouponInput,
  couponError, setCouponError,
  couponCode, couponDetails,
  validatingCoupon,
  onApplyCoupon, onClearCoupon,
  onProceed, onClose, loading,
  getDisplayPrice,
}: {
  plan: Plan;
  offer: ActiveOffer | null;
  couponInput: string; setCouponInput: (v: string) => void;
  couponError: string; setCouponError: (v: string) => void;
  couponCode: string | null;
  couponDetails: { discountType: string; discountValue: number; applicablePlans: string } | null;
  validatingCoupon: boolean;
  onApplyCoupon: () => void;
  onClearCoupon: () => void;
  onProceed: () => void;
  onClose: () => void;
  loading: boolean;
  getDisplayPrice: (plan: Plan) => { original: number; discount: number; final: number; applicable: boolean };
}) {
  const dp = getDisplayPrice(plan);
  const basePrice = offer ? offer.salePrice / 100 : plan.amountRupees;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-md bg-[#0c0a20] border border-white/[0.08] rounded-t-3xl sm:rounded-2xl p-6 pb-[max(env(safe-area-inset-bottom),24px)] animate-fade-up max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors">
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <p className="dark-kicker text-[10px]">Complete Your Purchase</p>
          <h2 className="text-xl font-extrabold text-white mt-1">{plan.name}</h2>
          <p className="text-[13px] text-white/35 mt-0.5">One-time payment · No auto-renewal</p>
        </div>

        <div className="bg-white/[0.03] rounded-xl p-4 mb-5">
          {dp.discount > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/40">Original price</span>
                <span className="text-sm text-white/40 line-through">₹{dp.original}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-emerald-300 font-bold">
                  {offer ? `Offer discount (${offer.discountPercent}% off)` : 'Coupon discount'}
                </span>
                <span className="text-sm text-emerald-300 font-bold">-₹{dp.discount}</span>
              </div>
              <div className="border-t border-white/[0.06] pt-2 flex items-center justify-between">
                <span className="text-base font-extrabold text-white">You pay</span>
                <span className="text-2xl font-extrabold text-emerald-400">₹{dp.final}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-base font-extrabold text-white">Total</span>
              <span className="text-2xl font-extrabold text-white">₹{basePrice}</span>
            </div>
          )}
        </div>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2.5">
            <Tag size={14} className="text-brand-400" />
            <span className="text-[13px] font-bold text-white/60">Have a coupon?</span>
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
              <button onClick={onClearCoupon}
                className="px-4 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-bold hover:bg-emerald-500/30 transition-colors inline-flex items-center gap-1.5">
                <X size={14} /> Remove
              </button>
            ) : (
              <button onClick={onApplyCoupon} disabled={validatingCoupon || !couponInput.trim()}
                className="px-5 py-3 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 text-sm font-bold hover:bg-brand-500/30 transition-colors disabled:opacity-40">
                {validatingCoupon ? 'Checking...' : 'Apply'}
              </button>
            )}
          </div>
          {couponCode && couponDetails && (
            <div className="mt-2.5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
              <p className="text-xs font-bold text-emerald-300">✓ Coupon &ldquo;{couponCode}&rdquo; applied!</p>
            </div>
          )}
          {couponError && (
            <p className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">{couponError}</p>
          )}
        </div>

        <button
          onClick={onProceed}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#6C4DFF] to-[#7C3AED] text-white text-sm font-bold shadow-[0_8px_24px_-6px_rgba(108,77,255,0.5)] hover:from-[#5B3DEE] hover:to-[#6D2FD4] active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">Processing...</span>
          ) : dp.discount > 0 ? (
            <span>Proceed to Payment — ₹{dp.final}</span>
          ) : (
            <span>Proceed to Payment — ₹{basePrice}</span>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription, loading: authLoading } = useAuth();
  const { checkout, loading: razorpayLoading, error: razorpayError, clearCoupon } = useRazorpay();
  const googleBilling = useGoogleBilling();
  
  // Use appropriate loading/error state based on platform
  const loading = googleBilling.isAndroid ? googleBilling.purchasing : razorpayLoading;
  const error = googleBilling.isAndroid ? googleBilling.error : razorpayError;

  // Active offers state
  const [activeOffers, setActiveOffers] = useState<Record<string, ActiveOffer>>({});

  // Checkout modal state
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Coupon state (used inside checkout modal)
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDetails, setCouponDetails] = useState<{ discountType: string; discountValue: number; applicablePlans: string } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Fetch active offers on mount
  useEffect(() => {
    fetch('/api/offers/active')
      .then(r => r.json())
      .then(data => {
        if (data.offers) setActiveOffers(data.offers);
      })
      .catch(() => {}); // silently fail — offers table may not exist yet
  }, []);

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
      const planId = selectedPlan?.id || PLAN_LIST[0].id;
      const res = await fetch('/api/coupon/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: couponInput.trim(), planId }),
      });
      const data = await res.json();

      if (data.valid) {
        setCouponCode(data.couponCode);
        setCouponDetails({
          discountType: data.discountType,
          discountValue: data.discountValue,
          applicablePlans: data.applicablePlans || 'all',
        });
      } else {
        setCouponError(data.error || 'Invalid coupon code');
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

  /**
   * Calculate display price considering both offer and coupon.
   * Offer replaces MRP as the base; coupon applies on top.
   */
  const getDisplayPrice = (plan: Plan) => {
    const offer = activeOffers[plan.id];
    const basePaise = offer ? offer.salePrice : plan.amount;

    if (couponCode && couponDetails && isPlanApplicable(plan.id)) {
      let discountPaise = 0;
      if (couponDetails.discountType === 'percentage') {
        discountPaise = Math.floor(basePaise * couponDetails.discountValue / 100);
      } else {
        discountPaise = Math.min(couponDetails.discountValue, basePaise);
      }
      discountPaise = Math.min(discountPaise, basePaise - 100);
      discountPaise = Math.max(discountPaise, 0);
      const finalPaise = basePaise - discountPaise;
      return { original: (offer ? offer.salePrice : plan.amount) / 100, discount: discountPaise / 100, final: finalPaise / 100, applicable: true };
    }

    if (offer) {
      // Show offer discount on the card
      return { original: offer.mrp / 100, discount: (offer.mrp - offer.salePrice) / 100, final: offer.salePrice / 100, applicable: false };
    }

    return { original: plan.amountRupees, discount: 0, final: plan.amountRupees, applicable: false };
  };

  const handleSelectPlan = (plan: Plan) => {
    if (!user) { navigate('/login'); return; }
    handleClearCoupon();
    setSelectedPlan(plan);
  };

  const handleProceedPayment = async () => {
    if (!selectedPlan) return;
    
    // Use Google Play Billing on Android, Razorpay on web
    let success = false;
    
    if (googleBilling.isAndroid) {
      // Google Play Billing — use product ID from Google Play Console
      const googleProductId = GOOGLE_PRODUCT_IDS[selectedPlan.id as GoogleProductId];
      if (googleProductId) {
        success = await googleBilling.purchase(selectedPlan.id as GoogleProductId);
      } else {
        console.error('No Google product ID for plan:', selectedPlan.id);
        // Fallback to Razorpay
        const appliedCode = couponCode && isPlanApplicable(selectedPlan.id) ? couponCode : undefined;
        success = await checkout(selectedPlan.id, selectedPlan.name, selectedPlan.amountRupees, appliedCode);
      }
    } else {
      // Web — use Razorpay
      const appliedCode = couponCode && isPlanApplicable(selectedPlan.id) ? couponCode : undefined;
      success = await checkout(selectedPlan.id, selectedPlan.name, selectedPlan.amountRupees, appliedCode);
    }
    
    if (success) {
      setSelectedPlan(null);
      navigate(`/payment/success?plan=${selectedPlan.id}`);
    }
  };

  const handleCloseModal = () => {
    setSelectedPlan(null);
    handleClearCoupon();
  };

  const isLoading = authLoading;

  return (
    <>
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
            const offer = activeOffers[plan.id];
            const dp = getDisplayPrice(plan);
            const hasOffer = !!offer;
            const isPopular = plan.id === 'six_month';
            const planBadge = plan.badge;

            return (
              <div key={plan.id} className={`dark-card relative p-6 ${
                isPopular ? '!border-[#6C4DFF]/30 shadow-[0_0_0_1px_rgba(108,77,255,0.15),0_12px_40px_-12px_rgba(108,77,255,0.25)]' : ''
              }`}>
                {/* Offer label badge */}
                {hasOffer && offer.label && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-lg tracking-wide whitespace-nowrap flex items-center gap-1.5">
                    <Flame size={11} strokeWidth={2.5} /> {offer.label}
                  </div>
                )}

                {/* Plan badge (only if no offer badge) */}
                {planBadge && !hasOffer && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C4DFF] to-accent-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1.5">
                    {planBadge}
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="font-extrabold text-white text-lg">{plan.name}</h2>
                    <p className="text-[13px] text-white/35 mt-0.5">One-time payment · No auto-renewal</p>
                  </div>
                  <div className="text-right">
                    {/* Price display with offer */}
                    {hasOffer ? (
                      <div>
                        <span className="text-lg text-white/30 line-through">₹{dp.original}</span>
                        <span className="text-3xl font-extrabold text-white ml-2">₹{dp.final}</span>
                        <p className="text-[11px] text-green-400 font-bold mt-0.5">
                          {offer.discountPercent}% OFF
                        </p>
                      </div>
                    ) : (
                      <span className="text-3xl font-extrabold text-white">₹{plan.amountRupees}</span>
                    )}
                    <p className="text-[11px] text-white/25 font-semibold uppercase tracking-wide mt-1">{plan.durationLabel}</p>
                  </div>
                </div>

                {/* Offer expiry info */}
                {hasOffer && (
                  <div className="mb-4 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-[11px] text-orange-300 font-medium">
                      🔥 Offer ends {formatExpiryShort(offer.endAt)}
                    </p>
                  </div>
                )}

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
                  </div>
                )}

                {state.type === 'upgrade' && (
                  <div className="space-y-2">
                    <p className="text-center text-[12px] text-amber-300/80 font-semibold">
                      ↑ Upgrade from current plan
                    </p>
                    <button onClick={() => handleSelectPlan(plan)} disabled={loading}
                      className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                        isPopular ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                      } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {loading ? 'Processing...' : hasOffer
                        ? `Upgrade to ${plan.durationLabel} — ₹${dp.final}`
                        : `Upgrade to ${plan.durationLabel} — ₹${plan.amountRupees}`}
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
                  <button onClick={() => handleSelectPlan(plan)} disabled={loading}
                    className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                      isPopular ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {loading ? 'Processing...' : hasOffer
                      ? `Get ${plan.durationLabel} — ₹${dp.final}`
                      : `Get ${plan.durationLabel} — ₹${plan.amountRupees}`}
                  </button>
                )}
              </div>
            );
          })
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

    {/* ══════════ CHECKOUT MODAL ══════════ */}
    {selectedPlan && (
      <CheckoutModal
        plan={selectedPlan}
        offer={activeOffers[selectedPlan.id] || null}
        couponInput={couponInput}
        setCouponInput={setCouponInput}
        couponError={couponError}
        setCouponError={setCouponError}
        couponCode={couponCode}
        couponDetails={couponDetails}
        validatingCoupon={validatingCoupon}
        onApplyCoupon={handleApplyCoupon}
        onClearCoupon={handleClearCoupon}
        onProceed={handleProceedPayment}
        onClose={handleCloseModal}
        loading={loading}
        getDisplayPrice={getDisplayPrice}
      />
    )}
    </>
  );
}
