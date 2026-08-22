import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { courseMetadata } from '../data/content';
import { PLAN_LIST, type Plan } from '../config/plans';
import CourseIcon from '../components/CourseIcon';
import {
  Headphones, ArrowRight, Shield, Zap, CreditCard, Star,
  Volume2, Mic, CheckCircle2, ChevronRight, Globe, Users,
  Lock, Play, BookOpen, Sparkles, MessageCircle, Briefcase,
  Building2, Plane, ShoppingCart, GraduationCap, Baby,
  TrendingUp, Award
} from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Homemaker · Jaipur',
    text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon.',
    initial: 'P',
    gradient: 'from-rose-400 to-pink-600',
  },
  {
    name: 'Rahul Verma',
    role: 'Student · Lucknow',
    text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Selection ho gayi!',
    initial: 'R',
    gradient: 'from-sky-400 to-blue-600',
  },
  {
    name: 'Anita Gupta',
    role: 'Teacher · Meerut',
    text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai.',
    initial: 'A',
    gradient: 'from-amber-400 to-orange-500',
  },
];

// Learning goals that map to courses
const LEARNING_GOALS = [
  { label: 'Speak Basic English', desc: 'Daily conversations aur simple sentences', icon: MessageCircle, gradient: 'from-emerald-50 to-green-50', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600', courseId: 'beginner' },
  { label: 'Job & Interview', desc: 'Interview mein confidently answer dena', icon: Briefcase, gradient: 'from-rose-50 to-pink-50', iconBg: 'bg-rose-100', iconColor: 'text-rose-600', courseId: 'interview' },
  { label: 'Workplace English', desc: 'Office mein professional English', icon: Building2, gradient: 'from-blue-50 to-indigo-50', iconBg: 'bg-blue-100', iconColor: 'text-blue-600', courseId: 'corporate' },
  { label: 'Travel English', desc: 'Travel ke time useful English', icon: Plane, gradient: 'from-cyan-50 to-teal-50', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600', courseId: 'travel' },
  { label: 'Daily Life English', desc: 'Market, home, phone aur daily conversations', icon: ShoppingCart, gradient: 'from-amber-50 to-orange-50', iconBg: 'bg-amber-100', iconColor: 'text-amber-600', courseId: 'daily-life' },
  { label: 'Advanced English', desc: 'Fluency aur advanced sentence patterns', icon: TrendingUp, gradient: 'from-purple-50 to-violet-50', iconBg: 'bg-purple-100', iconColor: 'text-purple-600', courseId: 'advanced' },
];

// Course level descriptions
const COURSE_LEVELS = [
  {
    id: 'beginner',
    title: 'Beginner English',
    hook: 'English samajh aati hai, par bolne mein hesitation hota hai?',
    stat: '725+ Sentences · 29 Lessons',
    cta: 'Start Beginner',
  },
  {
    id: 'intermediate',
    title: 'Intermediate English',
    hook: 'Basic English bol lete ho? Ab fluency improve karo.',
    stat: '350+ Sentences · 14 Lessons',
    cta: 'Continue Intermediate',
  },
  {
    id: 'advanced',
    title: 'Advanced English',
    hook: 'Natural aur confident English bolna seekho.',
    stat: '300+ Sentences · 12 Lessons',
    cta: 'Explore Advanced',
  },
];

const FREE_TRIAL_FEATURES = [
  '25 real-life sentences',
  'Hindi meaning',
  'Natural audio',
  'Listen practice',
  'Speaking practice',
  'No login',
  'No payment',
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleSelectPlan = (_plan: Plan) => {
    if (!user) { navigate('/login'); return; }
    navigate('/pricing');
  };

  return (
    <div className="space-y-6 -mt-1 pb-2 animate-fade-in w-full max-w-full overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative overflow-hidden rounded-3xl text-white shadow-premium-lg animate-fade-up"
        style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4338ca 60%, #6366f1 100%)' }}>
        <div className="absolute -right-10 -top-12 w-44 h-44 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 bottom-0 w-40 h-40 bg-accent-400/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

        <div className="relative p-5 sm:p-6">
          <div className="text-center sm:text-left">
            {/* Core message */}
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight">
              English Padhne Se Nahi,
              <span className="block bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent">
                Bolne Se Aati Hai.
              </span>
            </h1>
            <p className="text-white/75 text-xs sm:text-sm leading-relaxed mt-2 max-w-sm mx-auto sm:mx-0">
              Roz sirf 10–15 minute. Suno. Bolo. Repeat Karo.<br />
              Real-life English ko confidently bolna seekho.
            </p>

            {/* Sample sentence */}
            <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
              <p className="text-[13px] font-semibold text-white leading-snug">
                "I can understand English, but I can't speak it confidently."
              </p>
              <p className="text-[11px] text-white/60 mt-1">
                मुझे अंग्रेज़ी समझ आती है, पर मैं आत्मविश्वास से बोल नहीं पाता।
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-full">🎧 SUNO</span>
                <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-full">🎙️ BOLO</span>
                <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2 py-1 rounded-full">✓ USE KARO</span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
              <button
                onClick={() => navigate('/free-trial')}
                className="btn-premium px-5 py-3 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50"
              >
                <Headphones size={16} strokeWidth={2.5} />
                Start Free — 25 Sentences
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-premium btn-premium-ghost px-4 py-3 text-sm"
              >
                See How It Works
                <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
            <p className="text-[11px] text-white/50 mt-2 font-medium">No Login · No Payment · 25 Free Sentences</p>
          </div>
        </div>
      </section>


      {/* ══════════ START HERE ══════════ */}
      {!subscription.active && (
        <section className="animate-fade-up-1">
          <div className="card-premium !rounded-2xl p-4 text-center border-brand-100 bg-gradient-to-b from-brand-50/50 to-white">
            <p className="text-xs font-bold text-brand-600 mb-1">Start Here 👇</p>
            <h2 className="font-extrabold text-base text-gray-900">New to SunoBolo?</h2>
            <p className="text-gray-500 text-xs mt-1">Beginner English se start karo — roz 10 minute</p>
            <button
              onClick={() => navigate('/course/beginner')}
              className="mt-3 btn-premium btn-premium-gradient px-6 py-2.5 text-sm rounded-xl"
            >
              🌱 Start Beginner Course
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      )}

      {subscription.active && (
        <section className="animate-fade-up-1">
          <div className="card-premium !rounded-2xl p-4 text-center border-success-100 bg-gradient-to-b from-success-50/50 to-white">
            <p className="text-xs font-bold text-success-600 mb-1">Welcome back! 🎉</p>
            <h2 className="font-extrabold text-base text-gray-900">Continue Learning</h2>
            <button
              onClick={() => navigate('/courses')}
              className="mt-3 btn-premium btn-premium-gradient px-6 py-2.5 text-sm rounded-xl"
            >
              📚 Continue Practice
              <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      )}


      {/* ══════════ HOW IT WORKS ══════════ */}
      <section id="how-it-works" className="animate-fade-up-2">
        <div className="text-center mb-4">
          <p className="kicker">SunoBolo Method</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Sirf 3 Steps. Roz 10–15 Min.</h2>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { Icon: Volume2, step: '1', title: 'Suno', subtitle: 'Suno 3×', desc: 'Natural English suno — clear Indian English voice mein', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)]' },
            { Icon: Mic, step: '2', title: 'Bolo', subtitle: 'Bolo 3×', desc: 'Khud bolkar practice karo — sentence ko 3 baar zor se bolo', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_20px_-6px_rgba(236,72,153,0.5)]' },
            { Icon: CheckCircle2, step: '3', title: 'Use Karo', subtitle: 'Use Karo', desc: 'Real life mein use karo — jo seekha hai wo conversation mein lagao', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]' },
          ].map((s) => (
            <div key={s.step} className="card-premium !rounded-2xl p-3 text-center">
              <div className={`relative w-11 h-11 mx-auto rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-2 ${s.glow}`}>
                <s.Icon size={20} className="text-white" strokeWidth={2} />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border border-surface-100 shadow-sm text-[10px] font-extrabold text-surface-600 flex items-center justify-center">
                  {s.step}
                </span>
              </div>
              <p className="font-extrabold text-xs text-gray-900 leading-tight">{s.subtitle}</p>
              <p className="text-[10px] text-gray-500 mt-1 leading-snug">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Why this works */}
        <div className="mt-4 bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100 rounded-xl p-4">
          <p className="text-xs font-bold text-brand-800 mb-2">English bolne ke liye sirf grammar padhna enough nahi hai.</p>
          <p className="text-[11px] text-brand-700 leading-relaxed">
            English improve hoti hai jab aap: <strong>Sunte ho → Bolte ho → Repeat karte ho → Real life mein use karte ho.</strong>
          </p>
        </div>
      </section>


      {/* ══════════ WHAT WILL YOU LEARN? ══════════ */}
      <section className="animate-fade-up-3">
        <div className="text-center mb-3">
          <p className="kicker">Learning goals</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Apni English Kisliye Improve Karni Hai?</h2>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LEARNING_GOALS.map((goal) => (
            <button
              key={goal.label}
              onClick={() => navigate(`/course/${goal.courseId}`)}
              className={`bg-gradient-to-b ${goal.gradient} border border-surface-100 rounded-xl p-3 text-left hover:shadow-md transition-all active:scale-[.97]`}
            >
              <div className={`w-9 h-9 rounded-lg ${goal.iconBg} flex items-center justify-center mb-2`}>
                <goal.icon size={18} className={goal.iconColor} strokeWidth={2} />
              </div>
              <p className="text-[12px] font-bold text-gray-900 leading-tight">{goal.label}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-snug">{goal.desc}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ FREE TRIAL ══════════ */}
      <section className="animate-fade-up-3">
        <div className="text-center mb-3">
          <p className="kicker">Try first</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Pehle Try Karo. Phir Decide Karo.</h2>
          <p className="text-gray-500 text-xs mt-1">25 Real-Life English Sentences — Completely Free</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2 mb-4">
            {FREE_TRIAL_FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-1.5 text-xs text-gray-700">
                <CheckCircle2 size={14} className="text-success-500 shrink-0" strokeWidth={2.5} />
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/free-trial')}
            className="w-full btn-premium btn-premium-gradient py-3.5 text-sm rounded-xl font-bold"
          >
            🎧 Start Free Trial
            <ArrowRight size={14} strokeWidth={2.5} />
          </button>
        </div>
      </section>


      {/* ══════════ COURSE LEVELS ══════════ */}
      <section className="animate-fade-up-3">
        <div className="text-center mb-3">
          <p className="kicker">Structured courses</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Apne Level Se Start Karo</h2>
        </div>
        <div className="space-y-2.5">
          {COURSE_LEVELS.map((level) => {
            const meta = courseMetadata.find(c => c.id === level.id);
            return (
              <button
                key={level.id}
                onClick={() => navigate(`/course/${level.id}`)}
                className="w-full card-premium card-interactive !rounded-2xl p-4 text-left group"
              >
                <div className="flex items-center gap-3">
                  <CourseIcon courseId={level.id} size="md" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[13px] text-gray-900 group-hover:text-brand-700 transition-colors">{level.title}</h3>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">{level.hook}</p>
                    <p className="text-[10px] text-gray-400 font-semibold mt-1">{level.stat}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded-full group-hover:bg-brand-100 transition-colors">
                      {level.cta} →
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
          {/* View all courses */}
          <Link to="/courses" className="block text-center text-[12px] text-brand-600 font-bold hover:text-brand-700 py-2">
            View All Courses <ChevronRight size={12} className="inline" strokeWidth={3} />
          </Link>
        </div>
      </section>


      {/* ══════════ ENGLISH TENSES ══════════ */}
      <section className="animate-fade-up-4">
        <div className="text-center mb-3">
          <p className="kicker">Grammar</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Grammar Bhi Seekho — Lekin Bolkar</h2>
          <p className="text-gray-500 text-xs mt-1">Grammar ko rules ki tarah ratne ke bajay, real sentences ke through samjho aur bolo.</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-[13px] text-gray-900">English Tenses</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">12 Tenses · 200+ Sentences · Grammar Tips</p>
            </div>
          </div>
          {/* Example tense cards */}
          <div className="space-y-1.5 mb-3">
            {[
              { tense: 'Present', en: 'I go to work every day.', hi: 'मैं रोज़ काम पर जाता हूँ।' },
              { tense: 'Past', en: 'I went to work yesterday.', hi: 'मैं कल काम पर गया।' },
              { tense: 'Future', en: 'I will go to work tomorrow.', hi: 'मैं कल काम पर जाऊँगा।' },
            ].map((ex) => (
              <div key={ex.tense} className="bg-white/80 rounded-lg p-2.5 border border-indigo-100/50">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded">{ex.tense}</span>
                  <p className="text-[12px] font-semibold text-gray-900 flex-1">{ex.en}</p>
                </div>
                <p className="text-[10px] text-gray-500 mt-0.5">{ex.hi}</p>
              </div>
            ))}
          </div>
          <Link to="/tenses" className="w-full btn-premium bg-white border-2 border-indigo-200 text-indigo-700 py-3 text-sm rounded-xl font-bold block text-center hover:bg-indigo-50 transition-colors">
            📘 Explore Tenses
          </Link>
        </div>
      </section>


      {/* ══════════ PREMIUM VALUE ══════════ */}
      {!subscription.active && (
        <section className="animate-fade-up-4">
          <div className="text-center mb-3">
            <p className="kicker">Full access</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Full Access Mein Kya Milega?</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: '5,000+ Sentences', icon: BookOpen },
                { label: 'All Courses', icon: GraduationCap },
                { label: 'Grammar / 12 Tenses', icon: Award },
                { label: 'Listening Practice', icon: Volume2 },
                { label: 'Speaking Practice', icon: Mic },
                { label: 'Progress Tracking', icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-gray-700">
                  <item.icon size={14} className="text-brand-500 shrink-0" strokeWidth={2} />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-500 mb-2">One-time payment · No auto-renewal · Pay once, learn forever</p>
              <button
                onClick={() => navigate('/pricing')}
                className="btn-premium btn-premium-gradient px-8 py-3 text-sm rounded-xl"
              >
                Unlock Full Access →
              </button>
            </div>
          </div>
        </section>
      )}


      {/* ══════════ PROGRESS / MOTIVATION (for logged-in users) ══════════ */}
      {user && (
        <section className="animate-fade-up-4">
          <div className="card-premium !rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-brand-600 mb-1">Your Practice</p>
            <h3 className="font-extrabold text-base text-gray-900">Roz thoda thoda — bahut aage jaoge!</h3>
            <button
              onClick={() => navigate('/progress')}
              className="mt-3 btn-premium btn-premium-gradient px-6 py-2.5 text-sm rounded-xl"
            >
              📈 View Progress
            </button>
          </div>
        </section>
      )}


      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="animate-fade-up-4">
        <div className="text-center mb-3">
          <p className="kicker">Social proof</p>
          <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Learners Ko Kya Difference Dikha?</h2>
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
          ))}
        </div>
      </section>


      {/* ══════════ PRICING ══════════ */}
      {!subscription.active && (
        <section className="animate-fade-up-4">
          <div className="text-center mb-3">
            <p className="kicker">Pricing</p>
            <h2 className="font-extrabold text-base text-gray-900 mt-0.5">Ek Baar Pay Karo. English Improve Karte Raho.</h2>
            <p className="text-gray-500 text-xs mt-1">One-time payment · No auto-renewal · Full app access</p>
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


      {/* ══════════ FINAL CTA ══════════ */}
      <section className="animate-fade-up-4">
        <div className="hero-mesh relative overflow-hidden rounded-2xl text-white p-6 text-center shadow-premium-lg">
          <div className="absolute -right-8 -top-10 w-32 h-32 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-lg font-extrabold relative">
            English samajhne se confidence nahi aata.
          </h3>
          <p className="text-white/80 text-sm mt-1 relative">
            English bolne ki practice se aata hai.
          </p>
          <p className="text-white/60 text-xs mt-1 relative">
            Roz 10–15 minute. Suno. Bolo. Improve Karo.
          </p>
          <button
            onClick={() => navigate('/free-trial')}
            className="btn-premium px-7 py-3 mt-4 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50 relative"
          >
            Start Free Trial →
          </button>
        </div>
      </section>


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
