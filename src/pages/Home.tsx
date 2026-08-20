import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { allCourses } from '../data/content';
import { USER_GOALS } from '../data/goals';
import { PLAN_LIST, type Plan } from '../config/plans';
import InstallAppButton from '../components/InstallAppButton';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Homemaker · Jaipur',
    text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon. Awaaz ekdum natural lagti hai!',
    avatar: 'bg-gradient-to-br from-rose-400 to-pink-600',
    initial: 'P',
  },
  {
    name: 'Rahul Verma',
    role: 'Student · Lucknow',
    text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Meri selection ho gayi! 🎉',
    avatar: 'bg-gradient-to-br from-sky-400 to-blue-600',
    initial: 'R',
  },
  {
    name: 'Anita Gupta',
    role: 'Teacher · Meerut',
    text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai. Bahut badhiya app.',
    avatar: 'bg-gradient-to-br from-amber-400 to-orange-500',
    initial: 'A',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate(`/payment/success?plan=${plan.id}`);
  };

  return (
    <div className="space-y-5 -mt-1 pb-2 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* ══════════ HERO ══════════ */}
      <section className="hero-mesh relative overflow-hidden rounded-3xl text-white shadow-premium-lg animate-fade-up">
        <div className="absolute -right-10 -top-12 w-44 h-44 bg-white/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-40 h-40 bg-accent-400/40 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-2.5">
                <span className="chip-trust">🇮🇳 Made in India</span>
                <span className="chip-trust">
                  <span className="stars">★★★★★</span> 4.9
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                English Bolna Ab
                <span className="block bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent">
                  Aapke Haath Mein.
                </span>
              </h1>
              <p className="text-white/85 text-xs sm:text-sm leading-relaxed mt-2 max-w-sm mx-auto sm:mx-0">
                Suno · Bolo · Repeat. Real-life English with the same natural Indian English voice on every sentence.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <button
                  onClick={() => navigate('/free-trial')}
                  className="btn-premium px-5 py-3 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50"
                >
                  🎧 Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="btn-premium btn-premium-ghost px-4 py-3 text-sm"
                >
                  All Courses →
                </button>
              </div>
            </div>
            <div className="hidden sm:flex w-28 h-28 shrink-0 rounded-2xl overflow-hidden ring-4 ring-white/25 shadow-2xl bg-gradient-to-br from-brand-200 to-accent-200 rotate-2 animate-float">
              <img
                src="/images/hero.webp"
                alt="Student practicing English with SunoBolo"
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', backgroundColor: '#eef2ff' }}
                loading="eager"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Live stats */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { v: '10,000+', l: 'Active Learners' },
              { v: '4,075+', l: 'Real Sentences' },
              { v: '4.9 ★', l: 'User Rating' },
            ].map((s) => (
              <div key={s.l} className="glass-dark rounded-xl px-2 py-2.5 text-center">
                <p className="text-sm sm:text-base font-extrabold leading-none">{s.v}</p>
                <p className="text-[11px] sm:text-[11px] text-white/70 font-medium mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TRUST STRIP ══════════ */}
      <section className="grid grid-cols-3 gap-1.5 sm:gap-2 animate-fade-up-1">
        {[
          { e: '🔒', t: '100% Secure', d: 'No spam, ever', bg: 'from-emerald-50 to-green-50' },
          { e: '🎧', t: 'Free to Try', d: '25 sentences free', bg: 'from-violet-50 to-purple-50' },
          { e: '⚡', t: 'Instant Access', d: 'No waiting', bg: 'from-amber-50 to-orange-50' },
        ].map((x) => (
          <div key={x.t} className={`bg-gradient-to-b ${x.bg} border border-gray-100 !rounded-xl px-2 py-2.5 text-center shadow-sm`}>
            <div className="text-base mb-0.5">{x.e}</div>
            <p className="text-[11px] font-bold text-gray-900 leading-tight">{x.t}</p>
            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">{x.d}</p>
          </div>
        ))}
      </section>

      {/* ══════════ 3-STEP METHOD ══════════ */}
      <section className="animate-fade-up-2">
        <div className="flex items-end justify-between mb-2.5 px-0.5">
          <div>
            <p className="kicker">SunoBolo Method™</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Sirf 3 Steps. Roz 10–15 Min.</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: '🔊', step: '1', title: 'Suno 3×', desc: 'Natural audio, clear Indian voice', color: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_8px_20px_-6px_rgb(59_130_246_/_0.5)]' },
            { emoji: '🎤', step: '2', title: 'Bolo 3×', desc: 'Zor se bolkar confidence', color: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_20px_-6px_rgb(236_72_153_/_0.5)]' },
            { emoji: '✅', step: '3', title: 'Use Karo', desc: 'Real life mein use karo', color: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_20px_-6px_rgb(16_185_129_/_0.5)]' },
          ].map((s) => (
            <div key={s.step} className="card-premium !rounded-2xl p-3 text-center">
              <div className={`relative w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-lg mb-2 ${s.glow}`}>
                {s.emoji}
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-gray-100 shadow-sm text-[11px] font-extrabold text-gray-600 flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <p className="font-extrabold text-xs text-gray-900 leading-tight">{s.title}</p>
              <p className="text-[11px] text-gray-500 mt-1 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ FREE TRIAL BANNER ══════════ */}
      <button
        onClick={() => navigate('/free-trial')}
        className="w-full relative overflow-hidden rounded-2xl text-white p-4 text-left flex items-center gap-3 transition-all active:scale-[.98] animate-fade-up-2"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 55%, #4f46e5 100%)', boxShadow: '0 12px 32px -8px rgb(124 58 237 / .5)' }}
      >
        <div className="absolute -right-6 -top-8 w-24 h-24 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0 shadow-inner">🎧</div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm leading-tight">25 Sentences Free — Aaj Hi Try Karo</p>
          <p className="text-white/80 text-[11px] mt-0.5">No login · No payment · Full audio experience</p>
        </div>
        <span className="text-xl shrink-0 bg-white/15 rounded-full w-9 h-9 flex items-center justify-center">→</span>
      </button>

      {/* ══════════ GOALS ══════════ */}
      <section className="card-premium !rounded-2xl p-4 animate-fade-up-3">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <p className="kicker">Choose your goal</p>
            <h2 className="font-bold text-sm text-gray-900 mt-0.5">My goal is...</h2>
          </div>
          <Link to="/courses" className="text-[11px] text-brand-600 font-bold hover:text-brand-700">See all →</Link>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {USER_GOALS.slice(0, 9).map((g, i) => {
            const warmTints = [
              'from-blue-50 to-sky-50 hover:from-blue-100 hover:to-sky-100 border-blue-100 hover:border-blue-200',
              'from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-rose-100 hover:border-rose-200',
              'from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border-amber-100 hover:border-amber-200',
              'from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border-emerald-100 hover:border-emerald-200',
              'from-violet-50 to-purple-50 hover:from-violet-100 hover:to-purple-100 border-violet-100 hover:border-violet-200',
              'from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 border-cyan-100 hover:border-cyan-200',
              'from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 border-orange-100 hover:border-orange-200',
              'from-pink-50 to-fuchsia-50 hover:from-pink-100 hover:to-fuchsia-100 border-pink-100 hover:border-pink-200',
              'from-lime-50 to-green-50 hover:from-lime-100 hover:to-green-100 border-lime-100 hover:border-lime-200',
            ];
            return (
              <button
                key={g.id}
                onClick={() => navigate('/courses')}
                className={`bg-gradient-to-b ${warmTints[i % warmTints.length]} border rounded-xl p-2 text-center transition-all active:scale-95 shadow-sm hover:shadow-md`}
                title={g.label}
              >
                <div className="text-base mb-0.5 leading-none">{g.emoji}</div>
                <p className="text-[11px] sm:text-[11px] font-semibold text-gray-700 leading-tight line-clamp-2 min-h-[20px] flex items-center justify-center">{g.label}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* ══════════ COURSES ══════════ */}
      <section className="animate-fade-up-3">
        <div className="flex items-end justify-between mb-2.5 px-0.5">
          <div>
            <p className="kicker">Structured courses</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Pick Your Course</h2>
          </div>
          <Link to="/courses" className="text-[11px] text-brand-600 font-bold hover:text-brand-700">View all →</Link>
        </div>
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
          {allCourses.slice(0, 8).map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="card-premium !rounded-2xl p-3.5 block group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 group-hover:-rotate-3 ${course.color === 'accent' ? 'bg-gradient-to-br from-accent-100 to-accent-200' : 'bg-gradient-to-br from-brand-100 to-brand-200'}`}>
                  {course.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">{course.title}</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">{course.totalSentences} sentences · {course.totalLessons} lessons</p>
                </div>
                <div className="text-right shrink-0">
                  {course.isFree ? (
                    <span className="text-[11px] font-extrabold text-success-700 bg-success-100 border border-success-200 px-2 py-1 rounded-full">FREE</span>
                  ) : (
                    <span className="text-[11px] font-extrabold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded-full">PREMIUM</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="animate-fade-up-4">
        <div className="text-center mb-3">
          <p className="kicker">Loved by learners</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Learners Kya Kehte Hain</h2>
        </div>
        <div className="grid gap-2.5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card-premium !rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full ${t.avatar} text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md`}>
                  {t.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[13px] text-gray-900 truncate">{t.name}</p>
                    <span className="stars text-[11px] shrink-0">★★★★★</span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">{t.role}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1.5">“{t.text}”</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ INSTALL APP ══════════ */}
      <InstallAppButton variant="home" />

      {/* ══════════ PURCHASE PLAN ══════════ */}
      {!subscription.active && (
        <section className="animate-fade-up-4">
          <div className="text-center mb-3">
            <p className="kicker">Unlock full access</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">One-Time Payment. No Monthly Fees.</h2>
            <p className="text-gray-500 text-xs mt-1">Pay once, learn forever. No auto-debit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PLAN_LIST.map((plan) => (
              <div
                key={plan.id}
                className={`card-premium relative p-4 flex flex-col ${
                  plan.id === 'one_year'
                    ? '!border-brand-300 shadow-ring-brand bg-gradient-to-b from-brand-50/70 to-white'
                    : ''
                }`}
              >
                {plan.id === 'one_year' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap">
                    ⭐ BEST VALUE
                  </div>
                )}
                <div className="mb-3">
                  <h3 className="font-extrabold text-gray-900 text-sm">{plan.name} Full Access</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">One-time payment · No auto-renewal</p>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-gray-900">₹{plan.amountRupees}</span>
                  <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">ONE TIME · {plan.durationLabel}</p>
                </div>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <span className="w-4 h-4 rounded-full bg-success-100 text-success-700 border border-success-200 flex items-center justify-center text-[8px] font-bold shrink-0">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`btn-premium w-full py-3 text-sm font-bold rounded-xl ${
                    plan.id === 'one_year'
                      ? 'btn-premium-gradient'
                      : 'bg-white border-2 border-gray-200 text-gray-800 hover:border-brand-300 hover:text-brand-700'
                  }`}
                >
                  {user ? `Get ${plan.durationLabel} — ₹${plan.amountRupees}` : 'Sign Up & Get Access →'}
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { e: '🔒', t: 'Secure Payment', d: 'UPI · Cards' },
              { e: '⚡', t: 'Instant Access', d: 'Turant unlock' },
              { e: '💳', t: 'Pay Once', d: 'No hidden fees' },
            ].map(x => (
              <div key={x.t} className="card-premium !rounded-xl px-2 py-2.5 text-center">
                <div className="text-base mb-0.5">{x.e}</div>
                <p className="text-[11px] font-bold text-gray-900 leading-tight">{x.t}</p>
                <p className="text-[8px] text-gray-500 leading-tight mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <footer className="text-center pt-1 pb-2">
        <div className="hairline mb-3" />
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
          <span className="inline-flex items-center gap-1"><span className="stars text-[11px]">★</span> 4.9 rated</span>
          <span>·</span>
          <span>🔒 Secure</span>
          <span>·</span>
          <span>🇮🇳 Made in India</span>
        </div>
        <div className="mt-3">
          <InstallAppButton variant="footer" />
        </div>
        <p className="text-[11px] text-gray-400 mt-2">
          Made with ❤️ by <span className="text-gray-600 font-bold">Pankaj Upadhyay</span>
        </p>
        <p className="text-gray-300 mt-0.5 text-[11px]">Suno · Bolo · Repeat</p>
      </footer>
    </div>
  );
}
