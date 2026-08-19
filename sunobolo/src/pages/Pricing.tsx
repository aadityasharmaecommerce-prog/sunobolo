import { useNavigate } from 'react-router-dom';

export default function Pricing() {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Free Trial',
      price: 'Rs 0',
      desc: 'Try before you buy',
      features: ['25 practical sentences', 'Hindi meanings', 'Natural audio', 'Listen and Speak practice'],
      cta: 'Start Free',
      popular: false,
      action: () => navigate('/free-trial'),
    },
    {
      name: 'Single Course',
      price: 'Rs 199',
      desc: 'One course of your choice',
      features: ['Full course access', 'All sentences and audio', 'Progress tracking', 'Lifetime access'],
      cta: 'Buy Course',
      popular: true,
      action: () => navigate('/courses'),
    },
    {
      name: 'Complete Bundle',
      price: 'Rs 999',
      desc: 'All courses, best value',
      features: ['All present and future courses', '5000+ sentences', 'Priority support', 'Lifetime updates'],
      cta: 'Get Bundle',
      popular: false,
      action: () => navigate('/courses'),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-1">Start free, upgrade when ready</p>
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <div key={plan.name} className={'card p-5 relative ' + (plan.popular ? 'ring-2 ring-brand-500' : '')}>
            {plan.popular && (
              <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-brand-500 text-white text-xs font-bold px-4 py-0.5 rounded-full">
                Most Popular
              </div>
            )}
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900">{plan.name}</h2>
              <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
            </div>
            <p className="text-sm text-gray-500 mb-4">{plan.desc}</p>
            <ul className="space-y-2 mb-4">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full bg-success-100 text-success-600 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={plan.action} className={'btn btn-lg w-full ' + (plan.popular ? 'btn-primary' : 'btn-secondary')}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <div className="card p-5 text-center">
        <h2 className="font-bold text-gray-900">What You Get</h2>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { icon: '✅', text: 'Practical sentences' },
            { icon: '🔤', text: 'Hindi meaning' },
            { icon: '🔊', text: 'Natural audio' },
            { icon: '🎤', text: 'Listen 3x & Speak 3x' },
            { icon: '📊', text: 'Progress tracking' },
            { icon: '📚', text: 'Structured lessons' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <span>{item.icon}</span>
              <span className="text-xs text-gray-700">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-5 bg-gradient-to-r from-brand-500 to-accent-500 text-white border-0 text-center">
        <h3 className="text-lg font-bold">Still not sure?</h3>
        <p className="text-white/80 text-sm mt-1">Try 25 sentences absolutely free</p>
        <button
          onClick={() => navigate('/free-trial')}
          className="mt-4 bg-white text-brand-700 font-semibold px-6 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Start Free Trial →
        </button>
      </div>
    </div>
  );
}
