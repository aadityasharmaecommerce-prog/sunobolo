import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLAN_LIST, type Plan } from '../config/plans';

export default function Pricing() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleSelect = (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    // One-time payment — activate directly
    navigate(`/payment/success?plan=${plan.id}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center pt-2">
        <p className="kicker">Simple & honest pricing</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Choose Your Learning Plan</h1>
        <p className="text-gray-500 text-sm mt-1.5">One-time payment. No monthly subscription. No auto-debit. Pay once, learn forever.</p>
        <div className="inline-flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
          <span className="stars">★★★★★</span> 4.9 · 10,000+ learners trust SunoBolo
        </div>
      </div>

      {subscription.active && (
        <div className="card-premium !rounded-2xl p-4 text-center border-success-200 bg-success-50/30">
          <p className="text-sm font-bold text-success-700">🟢 You have active access!</p>
          <p className="text-xs text-gray-500 mt-1">Your plan is active until expiry. No need to purchase again.</p>
        </div>
      )}

      <div className="grid gap-4">
        {PLAN_LIST.map((plan, i) => (
          <div
            key={plan.id}
            className={`card-premium relative p-5 animate-fade-up-${i + 1} ${
              plan.id === 'one_year'
                ? '!border-brand-300 shadow-ring-brand bg-gradient-to-b from-brand-50/70 to-white'
                : ''
            }`}
          >
            {plan.id === 'one_year' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-full shadow-glow-brand tracking-wide">
                ⭐ BEST VALUE
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-extrabold text-gray-900">{plan.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">One-time payment · No auto-renewal</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-gray-900">₹{plan.amountRupees}</span>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{plan.durationLabel}</p>
              </div>
            </div>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-[13px] text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-success-100 text-success-700 border border-success-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => handleSelect(plan)}
              className={`btn-premium w-full py-3 text-sm ${
                plan.id === 'one_year'
                  ? 'btn-premium-gradient'
                  : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              Get {plan.durationLabel} — ₹{plan.amountRupees}
            </button>
          </div>
        ))}
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-2 animate-fade-up-4">
        {[
          { e: '🎓', t: '5,000+ Sentences', d: 'Real-life English' },
          { e: '🔒', t: 'Secure Payment', d: 'UPI · Cards · NetBanking' },
          { e: '⚡', t: 'Instant Access', d: 'Payment ke turant baad' },
        ].map((x) => (
          <div key={x.t} className="card-premium !rounded-xl px-2 py-3 text-center">
            <div className="text-base mb-1">{x.e}</div>
            <p className="text-[10px] font-bold text-gray-900 leading-tight">{x.t}</p>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{x.d}</p>
          </div>
        ))}
      </div>

      <div className="hero-mesh relative overflow-hidden rounded-2xl text-white p-6 text-center shadow-premium-lg animate-fade-up-4">
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

      <div className="h-6" />
    </div>
  );
}
