import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { courseMetadata } from '../data/content';
import { PLAN_LIST, type Plan } from '../config/plans';
import CourseIcon from '../components/CourseIcon';
import {
  Headphones, ArrowRight, Shield, Zap, CreditCard, Star,
  Volume2, Mic, CheckCircle2, ChevronRight, Globe, Users,
  Lock, Play, BookOpen, Sparkles
} from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Homemaker · Jaipur',
    text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon. Awaaz ekdum natural lagti hai!',
    initial: 'P',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    name: 'Rahul Verma',
    role: 'Student · Lucknow',
    text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Meri selection ho gayi!',
    initial: 'R',
    gradient: 'from-sky-400 to-blue-600',
  },
  {
    name: 'Anita Gupta',
    role: 'Teacher · Meerut',
    text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai. Bahut badhiya app.',
    initial: 'A',
    gradient: 'from-amber-400 to-orange-500',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleSelectPlan = (_plan: Plan) => {
    if (!user) { navigate('/login'); return; }
    navigate(`/pricing`);
  };

  return (
    <div className="space-y-6 -mt-1 pb-2 animate-fade-in w-full max-w-full overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden rounded-3xl text-white shadow-premium-lg animate-fade-up"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }}>
        {/* Decorative blurs */}
        <div className="absolute -right-10 -top-12 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-40 h-40 bg-accent-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-4 bottom-4 w-32 h-32 bg-brand-300/20 rounded-full blur-2xl pointer-events-none" />
        
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
        
        <div className="relative p-5 sm:p-6">
          {/* Trust badges */}
          <div className="flex items-center gap-2 mb-3 justify-center sm:justify-start">
            <span className="chip-trust">
              <Globe size={10} strokeWidth={2.5} />
              Made in India
            </span>
            <span className="chip-trust">
              <Star size={10} strokeWidth={2.5} fill="currentColor" />
              4.9
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
                English Bolna Ab
                <span className="block bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent">
                  Aapke Haath Mein.
                </span>
              </h1>
              <p className="text-white/75 text-xs sm:text-sm leading-relaxed mt-2 max-w-sm mx-auto sm:mx-0">
                Suno · Bolo · Repeat. Real-life English with the same natural Indian English voice on every sentence.
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <button
                  onClick={() => navigate('/free-trial')}
                  className="btn-premium px-5 py-3 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50"
                >
                  <Headphones size={16} strokeWidth={2.5} />
                  Start Free Trial
                </button>
                <button
                  onClick={() => navigate('/courses')}
                  className="btn-premium btn-premium-ghost px-4 py-3 text-sm"
                >
                  All Courses
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            </div>
            
            {/* Hero illustration */}
            <div className="hidden sm:flex w-28 h-28 shrink-0 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-2xl bg-gradient-to-br from-brand-200 to-accent-200 rotate-2 animate-float">
              <img
                src="/images/hero.webp"
                alt="Student practicing English"
                className="w-full h-full object-cover"
                loading="eager"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mt-5">
            {[
              { v: '10,000+', l: 'Active Learners', Icon: Users },
              { v: '4,075+', l: 'Real Sentences', Icon: BookOpen },
              { v: '4.9 ★', l: 'User Rating', Icon: Star },
            ].map((s) => (
              <div key={s.l} className="glass-dark rounded-xl px-2 py-2.5 text-center">
                <s.Icon size={14} className="text-white/50 mx-auto mb-1" strokeWidth={2} />
                <p className="text-sm sm:text-base font-extrabold leading-none">{s.v}</p>
                <p className="text-[10px] text-white/50 font-medium mt-1">{s.l}</p>
              </div>
            ))}
          </div>        </div>
        {/* Tenses Card */}
        <Link to="/tenses" className="card-premium card-interactive !rounded-2xl p-4 block group mt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">12 tenses · 200+ sentences · Grammar tips</p>
            </div>
          </div>
        </Link>
      </section>



      {/* ══════════ TRUST STRIP ══════════ */}
      <section className="grid grid-cols-3 gap-1.5 sm:gap-2 animate-fade-up-1">
        {[
          { Icon: Shield, t: '100% Secure', d: 'No spam, ever', gradient: 'from-emerald-50 to-green-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
          { Icon: Headphones, t: 'Free to Try', d: '25 sentences free', gradient: 'from-violet-50 to-purple-50', iconBg: 'bg-violet-100', iconColor: 'text-violet-600' },
          { Icon: Zap, t: 'Instant Access', d: 'No waiting', gradient: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600' },
        ].map((x) => (
          <div key={x.t} className={`bg-gradient-to-b ${x.gradient} border border-surface-100 !rounded-xl px-2 py-3 text-center shadow-sm`}>
            <div className={`w-8 h-8 rounded-lg ${x.iconBg} flex items-center justify-center mx-auto mb-1.5`}>
              <x.Icon size={16} className={x.iconColor} strokeWidth={2} />
            </div>
            <p className="text-[11px] font-bold text-gray-900 leading-tight">{x.t}</p>
            <p className="text-[10px] text-gray-500 leading-tight mt-0.5">{x.d}</p>
          </div>
        ))}
      </section>

      {/* ══════════ 3-STEP METHOD ══════════ */}
      <section className="animate-fade-up-2">
        <div className="flex items-end justify-between mb-3 px-0.5">
          <div>
            <p className="kicker">SunoBolo Method</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Sirf 3 Steps. Roz 10–15 Min.</h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: Volume2, step: '1', title: 'Suno 3×', desc: 'Natural audio, clear Indian voice', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]' },
            { Icon: Mic, step: '2', title: 'Bolo 3×', desc: 'Zor se bolkar confidence', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)]' },
            { Icon: CheckCircle2, step: '3', title: 'Use Karo', desc: 'Real life mein use karo', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]' },
          ].map((s) => (
            <div key={s.step} className="card-premium !rounded-2xl p-3 text-center">
              <div className={`relative w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2 ${s.glow}`}>
                <s.Icon size={20} className="text-white" strokeWidth={2} />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-surface-100 shadow-sm text-[10px] font-extrabold text-surface-600 flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <p className="font-extrabold text-xs text-gray-900 leading-tight">{s.title}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug">{s.desc}</p>
            </div>
          ))}        </div>
        {/* Tenses Card */}
        <Link to="/tenses" className="card-premium card-interactive !rounded-2xl p-4 block group mt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">12 tenses · 200+ sentences · Grammar tips</p>
            </div>
          </div>
        </Link>
      </section>



      {/* ══════════ FREE TRIAL BANNER ══════════ */}
      <button
        onClick={() => navigate('/free-trial')}
        className="w-full relative overflow-hidden rounded-2xl text-white p-5 text-left flex items-center gap-4 transition-all active:scale-[.98] animate-fade-up-2"
        style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 45%, #4f46e5 100%)', boxShadow: '0 12px 32px -8px rgb(124 58 237 / .5)' }}
      >
        <div className="absolute -right-6 -top-8 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-4 bottom-0 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 shadow-inner">
          <Play size={22} className="text-white" fill="white" strokeWidth={0} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm leading-tight">25 Sentences Free — Aaj Hi Try Karo</p>
          <p className="text-white/75 text-[11px] mt-1">No login · No payment · Full audio experience</p>
        </div>
        <ArrowRight size={18} className="text-white/80 shrink-0" strokeWidth={2.5} />
      </button>

      {/* ══════════ COURSES ══════════ */}
      <section className="animate-fade-up-3">
        <div className="flex items-end justify-between mb-3 px-0.5">
          <div>
            <p className="kicker">Structured courses</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Pick Your Course</h2>
          </div>
          <Link to="/courses" className="text-[11px] text-brand-600 font-bold hover:text-brand-700 inline-flex items-center gap-0.5">
            View all <ChevronRight size={12} strokeWidth={3} />
          </Link>
        </div>
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {courseMetadata.slice(0, 8).map((course) => (
            <Link
              key={course.id}
              to={`/course/${course.id}`}
              className="card-premium card-interactive !rounded-2xl p-4 block group"
            >
              <div className="flex items-center gap-3">
                <CourseIcon courseId={course.id} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">{course.title}</h3>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">{course.totalSentences} sentences · {course.totalLessons} lessons</p>
                </div>
                <div className="text-right shrink-0">
                  {course.isFree ? (
                    <span className="text-[10px] font-extrabold text-success-700 bg-success-50 border border-success-200 px-2 py-0.5 rounded-full">FREE</span>
                  ) : (
                    <span className="text-[10px] font-extrabold text-surface-500 bg-surface-50 border border-surface-200 px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                      <Lock size={9} strokeWidth={2.5} />
                      PREMIUM
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}        </div>
        {/* Tenses Card */}
        <Link to="/tenses" className="card-premium card-interactive !rounded-2xl p-4 block group mt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">12 tenses · 200+ sentences · Grammar tips</p>
            </div>
          </div>
        </Link>
      </section>



      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="animate-fade-up-4">
        <div className="text-center mb-3">
          <p className="kicker">Loved by learners</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Learners Kya Kehte Hain</h2>
        </div>
        <div className="grid gap-3">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="card-premium !rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} text-white flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md`}>
                  {t.initial}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-[13px] text-gray-900 truncate">{t.name}</p>
                    <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} size={10} fill="currentColor" strokeWidth={0} />)}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 font-medium">{t.role}</p>
                  <p className="text-xs text-gray-600 leading-relaxed mt-1.5">"{t.text}"</p>
                </div>
              </div>
            </div>
          ))}        </div>
        {/* Tenses Card */}
        <Link to="/tenses" className="card-premium card-interactive !rounded-2xl p-4 block group mt-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[13px] text-gray-900 truncate group-hover:text-brand-700 transition-colors">English Tenses</h3>
                <span className="text-[10px] font-extrabold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full shrink-0">NEW</span>
              </div>
              <p className="text-[11px] text-gray-500 mt-0.5">12 tenses · 200+ sentences · Grammar tips</p>
            </div>
          </div>
        </Link>
      </section>



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
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-600 to-accent-600 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1">
                    <Sparkles size={10} strokeWidth={2.5} />
                    BEST VALUE
                  </div>
                )}
                <div className="mb-3">
                  <h3 className="font-extrabold text-gray-900 text-sm">{plan.name} Full Access</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">One-time payment · No auto-renewal</p>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-gray-900">₹{plan.amountRupees}</span>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">ONE TIME · {plan.durationLabel}</p>
                </div>
                <ul className="space-y-1.5 mb-4 flex-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                      <CheckCircle2 size={12} className="text-success-500 shrink-0" strokeWidth={2.5} />
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
                  {user ? `Get ${plan.durationLabel}` : 'Sign Up & Get Access'}
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { Icon: Shield, t: 'Secure Payment', d: 'UPI · Cards' },
              { Icon: Zap, t: 'Instant Access', d: 'Turant unlock' },
              { Icon: CreditCard, t: 'Pay Once', d: 'No hidden fees' },
            ].map(x => (
              <div key={x.t} className="card-premium !rounded-xl px-2 py-2.5 text-center">
                <x.Icon size={16} className="text-surface-500 mx-auto mb-1" strokeWidth={2} />
                <p className="text-[11px] font-bold text-gray-900 leading-tight">{x.t}</p>
                <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ══════════ FOOTER ══════════ */}
      <footer className="text-center pt-4 pb-2">
        <div className="hairline mb-3" />
        <div className="flex items-center justify-center gap-3 text-[11px] text-gray-400 font-medium">
          <span className="inline-flex items-center gap-1">
            <Star size={10} fill="currentColor" strokeWidth={0} className="text-amber-500" />
            4.9 rated
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Shield size={10} strokeWidth={2} />
            Secure
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Globe size={10} strokeWidth={2} />
            Made in India
          </span>
        </div>
        <p className="text-[11px] text-gray-400 mt-3">
          Made with care by <span className="text-gray-600 font-bold">Pankaj Upadhyay</span>
        </p>
        <p className="text-gray-300 mt-0.5 text-[11px]">Suno · Bolo · Repeat</p>
      </footer>
    </div>
  );
}
