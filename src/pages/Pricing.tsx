import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useRazorpay } from '../hooks/useRazorpay';
import { PLAN_LIST, type Plan } from '../config/plans';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { checkout, loading, error } = useRazorpay();

  const handleSelect = async (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    const success = await checkout(plan.id, plan.name, plan.amountRupees);
    if (success) {
      navigate(`/payment/success?plan=${plan.id}`);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/50 hover:text-white font-medium transition-colors"
      >
        <ArrowLeft size={16} strokeWidth={2.5} />
        Back
      </button>

      <div className="text-center pt-2">
        <p className="dark-kicker">Simple & honest pricing</p>
        <h1 className="text-2xl font-extrabold text-white mt-1">Ek Baar Pay Karo. English Improve Karte Raho.</h1>
        <p className="text-white/45 text-sm mt-1.5">One-time payment · No auto-renewal · Full app access</p>
        <div className="inline-flex items-center gap-1.5 mt-2.5 text-[11px] font-bold text-white/50 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
          <span className="text-amber-400">★★★★★</span> 4.9 · 10,000+ learners trust SunoBolo
        </div>
      </div>

      {subscription.active && (
        <div className="dark-card p-4 text-center border-emerald-500/20">
          <p className="text-sm font-bold text-emerald-300">🟢 You have active access!</p>
          <p className="text-xs text-white/40 mt-1">Your plan is active until expiry. No need to purchase again.</p>
        </div>
      )}

      <div className="grid gap-4">
        {PLAN_LIST.map((plan) => (
          <div
            key={plan.id}
            className={`dark-card relative p-5 ${
              plan.id === 'one_year'
                ? '!border-brand-400/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_8px_32px_-8px_rgba(99,102,241,0.3)]'
                : ''
            }`}
          >
            {plan.id === 'one_year' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-[11px] font-extrabold px-4 py-1 rounded-full shadow-glow-brand tracking-wide flex items-center gap-1">
                <Sparkles size={10} strokeWidth={2.5} />
                BEST VALUE
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-extrabold text-white">{plan.name}</h2>
                <p className="text-xs text-white/40 mt-0.5">One-time payment · No auto-renewal</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">₹{plan.amountRupees}</span>
                <p className="text-[11px] text-white/30 font-semibold uppercase tracking-wide">{plan.durationLabel}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-white/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-[11px] font-bold shrink-0">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan)}
              disabled={loading}
              className={`btn-premium w-full py-3 text-sm ${
                plan.id === 'one_year'
                  ? 'btn-premium-gradient'
                  : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Processing...' : `Get ${plan.durationLabel} — ₹${plan.amountRupees}`}
            </button>
          </div>
        ))}
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { e: '🎓', t: '5,000+ Sentences', d: 'Real-life English' },
          { e: '🔒', t: 'Secure Payment', d: 'UPI · Cards · NetBanking' },
          { e: '⚡', t: 'Instant Access', d: 'Payment ke turant baad' },
        ].map((x) => (
          <div key={x.t} className="dark-card-flat px-2 py-3 text-center">
            <div className="text-base mb-1">{x.e}</div>
            <p className="text-[11px] font-bold text-white leading-tight">{x.t}</p>
            <p className="text-[11px] text-white/35 mt-0.5 leading-tight">{x.d}</p>
          </div>
        ))}
      </div>

      {/* Free trial CTA */}
      <div className="relative overflow-hidden rounded-2xl text-white p-6 text-center"
        style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #7c3aed 70%, #a855f7 100%)' }}>
        <div className="absolute -right-8 -top-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <h3 className="text-lg font-extrabold relative">Still not sure?</h3>
        <p className="text-white/80 text-sm mt-1 relative">Try 25 sentences absolutely free — no login, no payment.</p>
        <button
          onClick={() => navigate('/free-trial')}
          className="btn-premium px-7 py-3 mt-4 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50 relative"
        >
          Start Free Trial →
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-sm text-red-300 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="mt-2 text-xs text-red-400 underline">Try again</button>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
