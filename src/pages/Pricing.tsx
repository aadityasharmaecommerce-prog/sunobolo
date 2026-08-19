import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free Trial',
      price: '₹0',
      per: 'forever free',
      desc: 'Try before you buy — no login needed',
      features: ['25 practical sentences', 'Hindi meanings', 'Natural Indian voice', 'Listen & Speak practice'],
      cta: 'Start Free',
      popular: false,
      action: () => navigate('/free-trial'),
    },
    {
      name: 'Single Course',
      price: '₹199',
      per: 'one-time · lifetime',
      desc: 'One full course of your choice',
      features: ['Full course access', 'All sentences + audio', 'Progress tracking', 'Lifetime access'],
      cta: 'Buy Course',
      popular: true,
      action: () => navigate('/courses'),
    },
    {
      name: 'Complete Bundle',
      price: '₹999',
      per: 'one-time · lifetime',
      desc: 'All courses — best value',
      features: ['All present & future courses', '5,000+ sentences', 'Priority support', 'Lifetime updates'],
      cta: 'Get Bundle',
      popular: false,
      action: () => navigate('/courses'),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="text-center pt-2">
        <p className="kicker">Simple & honest pricing</p>
        <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Choose Your Plan</h1>
        <p className="text-gray-500 text-sm mt-1.5">Start free. Upgrade when ready. Cancel anytime.</p>
        <div className="inline-flex items-center gap-1.5 mt-2.5 text-[10px] font-bold text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm">
          <span className="stars">★★★★★</span> 4.9 · 10,000+ learners trust SunoBolo
        </div>
      </div>

      <div className="grid gap-4">
        {plans.map((plan, i) => (
          <div
            key={plan.name}
            className={`card-premium relative p-5 animate-fade-up-${i + 1} ${
              plan.popular
                ? '!border-brand-300 shadow-ring-brand bg-gradient-to-b from-brand-50/70 to-white'
                : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-[10px] font-extrabold px-4 py-1 rounded-full shadow-glow-brand tracking-wide">
                ⭐ MOST POPULAR
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-extrabold text-gray-900">{plan.name}</h2>
                <p className="text-xs text-gray-500 mt-0.5">{plan.desc}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-gray-900">{plan.price}</span>
                <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{plan.per}</p>
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
              onClick={plan.action}
              className={`btn-premium w-full py-3 text-sm ${
                plan.popular ? 'btn-premium-gradient' : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-brand-300 hover:text-brand-700'
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* Trust row */}
      <div className="grid grid-cols-3 gap-2 animate-fade-up-4">
        {[
          { e: '🎓', t: '4,075+ Sentences', d: 'Real-life English' },
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
