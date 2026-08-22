import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { useRazorpay } from '../hooks/useRazorpay';
import { PLAN_LIST, type Plan } from '../config/plans';
import { ArrowLeft, Sparkles, Shield, Zap, CreditCard, Users, CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { checkout, loading, error } = useRazorpay();

  const handleSelect = async (plan: Plan) => {
    if (!user) { navigate('/login'); return; }
    const success = await checkout(plan.id, plan.name, plan.amountRupees);
    if (success) { navigate(`/payment/success?plan=${plan.id}`); }
  };

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

      {subscription.active && (
        <div className="dark-card p-5 text-center border-emerald-500/15">
          <p className="text-sm font-bold text-emerald-300">🟢 You have active access!</p>
          <p className="text-xs text-white/35 mt-1">Your plan is active until expiry. No need to purchase again.</p>
        </div>
      )}

      <div className="grid gap-4">
        {PLAN_LIST.map((plan) => (
          <div key={plan.id} className={`dark-card relative p-6 ${
            plan.id === 'one_year' ? '!border-[#6C4DFF]/30 shadow-[0_0_0_1px_rgba(108,77,255,0.15),0_12px_40px_-12px_rgba(108,77,255,0.25)]' : ''
          }`}>
            {plan.id === 'one_year' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C4DFF] to-accent-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1.5">
                <Sparkles size={11} strokeWidth={2.5} /> BEST VALUE
              </div>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-extrabold text-white text-lg">{plan.name}</h2>
                <p className="text-[13px] text-white/35 mt-0.5">One-time payment · No auto-renewal</p>
              </div>
              <div className="text-right">
                <span className="text-3xl font-extrabold text-white">₹{plan.amountRupees}</span>
                <p className="text-[11px] text-white/25 font-semibold uppercase tracking-wide mt-1">{plan.durationLabel}</p>
              </div>
            </div>
            <ul className="space-y-2.5 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/55">
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={() => handleSelect(plan)} disabled={loading}
              className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                plan.id === 'one_year' ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {loading ? 'Processing...' : `Get ${plan.durationLabel} — ₹${plan.amountRupees}`}
            </button>
          </div>
        ))}
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
