import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLAN_LIST } from '../config/plans';
import {
  Headphones, ArrowRight, Shield, Zap, CreditCard, Star,
  Volume2, Mic, CheckCircle2, ChevronRight, Globe,
  BookOpen, Sparkles, MessageCircle, Briefcase,
  Building2, Plane, ShoppingCart, GraduationCap,
  TrendingUp, Award, Check
} from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Homemaker · Jaipur', text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon.', initial: 'P', gradient: 'from-rose-400 to-pink-600' },
  { name: 'Rahul Verma', role: 'Student · Lucknow', text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Selection ho gayi!', initial: 'R', gradient: 'from-sky-400 to-blue-600' },
  { name: 'Anita Gupta', role: 'Teacher · Meerut', text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai.', initial: 'A', gradient: 'from-amber-400 to-orange-500' },
];

const LEARNING_GOALS = [
  { label: 'Speak Basic English', desc: 'Daily conversations aur simple sentences', icon: MessageCircle, gradient: 'from-emerald-500/20 to-green-500/10', border: 'border-emerald-500/20', iconColor: 'text-emerald-400', courseId: 'beginner' },
  { label: 'Job & Interview', desc: 'Interview mein confidently answer dena', icon: Briefcase, gradient: 'from-rose-500/20 to-pink-500/10', border: 'border-rose-500/20', iconColor: 'text-rose-400', courseId: 'interview' },
  { label: 'Workplace English', desc: 'Office mein professional English', icon: Building2, gradient: 'from-blue-500/20 to-indigo-500/10', border: 'border-blue-500/20', iconColor: 'text-blue-400', courseId: 'corporate' },
  { label: 'Travel English', desc: 'Travel ke time useful English', icon: Plane, gradient: 'from-cyan-500/20 to-teal-500/10', border: 'border-cyan-500/20', iconColor: 'text-cyan-400', courseId: 'travel' },
  { label: 'Daily Life English', desc: 'Market, home, phone aur daily conversations', icon: ShoppingCart, gradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/20', iconColor: 'text-amber-400', courseId: 'daily-life' },
  { label: 'Advanced English', desc: 'Fluency aur advanced sentence patterns', icon: TrendingUp, gradient: 'from-purple-500/20 to-violet-500/10', border: 'border-purple-500/20', iconColor: 'text-purple-400', courseId: 'advanced' },
];

const COURSE_LEVELS = [
  { id: 'beginner', title: 'Beginner English', hook: 'English samajh aati hai, par bolne mein hesitation hota hai?', stat: '725+ Sentences · 29 Lessons', cta: 'Start Beginner', emoji: '🌱', color: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'intermediate', title: 'Intermediate English', hook: 'Basic English bol lete ho? Ab fluency improve karo.', stat: '350+ Sentences · 14 Lessons', cta: 'Continue Intermediate', emoji: '🚀', color: 'from-blue-500/20 to-indigo-500/10' },
  { id: 'advanced', title: 'Advanced English', hook: 'Natural aur confident English bolna seekho.', stat: '300+ Sentences · 12 Lessons', cta: 'Explore Advanced', emoji: '🎯', color: 'from-purple-500/20 to-violet-500/10' },
];

const FREE_TRIAL_FEATURES = [
  '25 real-life sentences', 'Hindi meaning', 'Natural audio',
  'Listen practice', 'Speaking practice', 'No login', 'No payment',
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  return (
    <div className="space-y-0 pb-8 w-full max-w-full overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-12"
        style={{ background: 'linear-gradient(135deg, #0c0a1f 0%, #1a1145 25%, #2d1b69 50%, #4338ca 80%, #6366f1 100%)' }}>
        {/* Glow effects */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-brand-500/20 rounded-full blur-3xl pointer-events-none glow-pulse" />
        <div className="absolute -left-12 bottom-0 w-56 h-56 bg-accent-500/15 rounded-full blur-3xl pointer-events-none glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative p-5 sm:p-8 lg:p-12">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            {/* Left: Content */}
            <div className="flex-1 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 mb-5 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 border border-white/15">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-white/80 uppercase tracking-wider">India's Smart English Speaking Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-[1.1] tracking-tight text-white">
                English Padhne Se Nahi,
                <span className="block bg-gradient-to-r from-white via-brand-100 to-accent-200 bg-clip-text text-transparent">
                  Bolne Se Aati Hai.
                </span>
              </h1>

              <p className="text-white/60 text-sm sm:text-base leading-relaxed mt-4 max-w-md mx-auto lg:mx-0">
                Roz sirf 10–15 minute. Suno. Bolo. Repeat Karo.<br />
                Real-life English ko confidently bolna seekho.
              </p>

              {/* Sample sentence */}
              <div className="mt-5 bg-white/[0.07] backdrop-blur-sm rounded-xl p-4 border border-white/10 max-w-md mx-auto lg:mx-0">
                <p className="text-sm font-semibold text-white leading-snug">
                  "I can understand English, but I can't speak it confidently."
                </p>
                <p className="text-xs text-white/45 mt-1.5">
                  Mujhe Angrezi samajh aati hai, par main aatmavishwas se bol nahi paata.
                </p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">Listen</span>
                  <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">Speak</span>
                  <span className="text-[10px] font-bold text-white/80 bg-white/10 px-2.5 py-1 rounded-full">Use Karo</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                <button
                  onClick={() => navigate('/free-trial')}
                  className="btn-premium px-6 py-3.5 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50"
                >
                  <Headphones size={16} strokeWidth={2.5} />
                  Try 25 Free Sentences
                  <ArrowRight size={14} strokeWidth={2.5} />
                </button>
                <button
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-premium btn-premium-ghost px-5 py-3.5 text-sm"
                >
                  See How It Works
                </button>
              </div>

              {/* Trust points */}
              <div className="flex items-center gap-4 mt-4 justify-center lg:justify-start">
                {['No Login', 'No Payment', '100% Free to Try'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-[11px] text-white/45 font-medium">
                    <Check size={12} className="text-emerald-400" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: Hero illustration */}
            <div className="flex-1 w-full max-w-md lg:max-w-lg relative">
              <img
                src="/images/hero.webp"
                alt="SunoBolo — Indian students learning English with headphones and smartphone"
                className="w-full h-auto object-contain max-h-[420px] sm:max-h-[480px] drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]"
                loading="eager"
                width="600"
                height="500"
              />
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ START HERE ══════════ */}
      {!subscription.active && (
        <section className="mb-12">
          <div className="dark-card p-5 text-center">
            <p className="dark-kicker mb-1">Start Here</p>
            <h2 className="font-extrabold text-lg text-white">New to SunoBolo?</h2>
            <p className="text-white/45 text-sm mt-1">Beginner English se start karo — roz 10 minute</p>
            <button onClick={() => navigate('/course/beginner')}
              className="mt-4 btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl">
              Start Beginner Course <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      )}

      {subscription.active && (
        <section className="mb-12">
          <div className="dark-card p-5 text-center border-emerald-500/20">
            <p className="text-[10px] font-bold text-emerald-400 mb-1 tracking-wider uppercase">Welcome back!</p>
            <h2 className="font-extrabold text-lg text-white">Continue Learning</h2>
            <button onClick={() => navigate('/courses')}
              className="mt-4 btn-premium btn-premium-gradient px-6 py-3 text-sm rounded-xl">
              Continue Practice <ArrowRight size={14} strokeWidth={2.5} />
            </button>
          </div>
        </section>
      )}


      {/* ══════════ EXPLORE & LEARN — BENTO LAYOUT ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">Explore & Learn</p>
          <h2 className="font-extrabold text-xl text-white mt-1">Kya Seekhna Chahte Ho?</h2>
        </div>
        {/* Bento grid: large featured + smaller cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Large featured card */}
          <button onClick={() => navigate('/free-trial')}
            className="dark-card col-span-2 sm:col-span-1 p-5 text-left group active:scale-[0.99] bg-gradient-to-br from-brand-500/15 to-accent-500/10 border-brand-500/20">
            <div className="w-12 h-12 rounded-xl bg-brand-500/20 flex items-center justify-center mb-3">
              <Headphones size={24} className="text-brand-300" strokeWidth={2} />
            </div>
            <p className="text-base font-bold text-white">Daily Sentences</p>
            <p className="text-xs text-white/40 mt-1">Rozana ke English sentences — 25 free</p>
            <div className="mt-3 flex items-center gap-1 text-brand-300 text-xs font-bold group-hover:gap-2 transition-all">
              Start Free <ArrowRight size={12} strokeWidth={2.5} />
            </div>
          </button>

          {/* Smaller cards */}
          {[
            { label: 'Grammar', desc: '12 Tenses seekho', icon: BookOpen, gradient: 'from-indigo-500/15 to-purple-500/10', iconColor: 'text-indigo-400', path: '/tenses' },
            { label: 'Practice', desc: 'Bolkar practice karo', icon: Mic, gradient: 'from-pink-500/15 to-rose-500/10', iconColor: 'text-pink-400', path: '/free-trial' },
            { label: 'Courses', desc: 'Structured paths', icon: GraduationCap, gradient: 'from-emerald-500/15 to-green-500/10', iconColor: 'text-emerald-400', path: '/courses' },
            { label: 'All Sentences', desc: '5000+ real-life', icon: Volume2, gradient: 'from-amber-500/15 to-orange-500/10', iconColor: 'text-amber-400', path: '/courses' },
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`dark-card p-4 text-left bg-gradient-to-br ${item.gradient} active:scale-[0.97]`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <item.icon size={20} className={item.iconColor} strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-white leading-tight">{item.label}</p>
              <p className="text-xs text-white/40 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ HOW SUNOBOLO WORKS ══════════ */}
      <section id="how-it-works" className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">SunoBolo Method</p>
          <h2 className="font-extrabold text-xl text-white mt-1">Sirf 3 Steps. Roz 10–15 Min.</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { Icon: Volume2, step: '1', title: 'Suno', emoji: '🎧', desc: 'Natural Indian English voice mein suno — har sentence ko 3 baar suno.', gradient: 'from-blue-500 to-cyan-500', glow: 'shadow-[0_8px_24px_-6px_rgba(59,130,246,0.5)]' },
            { Icon: Mic, step: '2', title: 'Bolo', emoji: '🎙️', desc: 'Khud bolkar practice karo — sentence ko 3 baar zor se bolo.', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_24px_-6px_rgba(236,72,153,0.5)]' },
            { Icon: CheckCircle2, step: '3', title: 'Use Karo', emoji: '💬', desc: 'Real life mein use karo — jo seekha hai wo conversation mein lagao.', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_24px_-6px_rgba(16,185,129,0.5)]' },
          ].map((s) => (
            <div key={s.step} className="dark-card p-6 text-center relative overflow-hidden">
              {/* Connecting line on desktop */}
              {s.step !== '3' && <div className="hidden sm:block absolute top-1/2 -right-2 w-4 h-px bg-white/10" />}
              <div className={`relative w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 ${s.glow}`}>
                <span className="text-2xl">{s.emoji}</span>
                <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white/10 border border-white/20 text-[11px] font-extrabold text-white flex items-center justify-center backdrop-blur-sm">
                  {s.step}
                </span>
              </div>
              <p className="font-extrabold text-lg text-white">{s.title}</p>
              <p className="text-sm text-white/45 mt-2 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Why this works */}
        <div className="mt-6 dark-card-solid p-5 border-brand-500/20">
          <p className="text-sm font-bold text-white/90 mb-2">English bolne ke liye sirf grammar padhna enough nahi hai.</p>
          <p className="text-xs text-white/45 leading-relaxed">
            English improve hoti hai jab aap: <strong className="text-white/70">Sunte ho → Bolte ho → Repeat karte ho → Real life mein use karte ho.</strong>
          </p>
        </div>
      </section>


      {/* ══════════ WHAT WILL YOU LEARN ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">Learning Goals</p>
          <h2 className="font-extrabold text-xl text-white mt-1">Apni English Kisliye Improve Karni Hai?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {LEARNING_GOALS.map((goal) => (
            <button key={goal.label} onClick={() => navigate(`/course/${goal.courseId}`)}
              className={`dark-card bg-gradient-to-br ${goal.gradient} ${goal.border} p-4 text-left active:scale-[0.97]`}>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-3">
                <goal.icon size={20} className={goal.iconColor} strokeWidth={2} />
              </div>
              <p className="text-sm font-bold text-white leading-tight">{goal.label}</p>
              <p className="text-xs text-white/40 mt-1">{goal.desc}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ FREE TRIAL — CONVERSION PANEL ══════════ */}
      <section className="mb-12">
        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
          style={{ background: 'linear-gradient(135deg, #1a1145 0%, #2d1b69 40%, #4338ca 70%, #6366f1 100%)' }}>
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="flex-1">
              <p className="dark-kicker mb-2">Try First</p>
              <h2 className="font-extrabold text-xl sm:text-2xl text-white">Pehle Try Karo. Phir Decide Karo.</h2>
              <p className="text-white/50 text-sm mt-2">25 Real-Life English Sentences — Completely Free</p>

              <div className="grid grid-cols-2 gap-2 mt-4">
                {FREE_TRIAL_FEATURES.map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/free-trial')}
                className="mt-5 btn-premium px-8 py-3.5 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50">
                Start Free Trial <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>

            {/* Decorative illustration area */}
            <div className="hidden sm:flex w-48 h-48 rounded-2xl bg-white/5 border border-white/10 items-center justify-center shrink-0">
              <div className="text-center">
                <span className="text-5xl">🎧</span>
                <p className="text-xs text-white/40 mt-2 font-bold">25 Free Sentences</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ COURSE LEVELS ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">Structured Courses</p>
          <h2 className="font-extrabold text-xl text-white mt-1">Apne Level Se Start Karo</h2>
        </div>
        <div className="space-y-3">
          {COURSE_LEVELS.map((level) => (
            <button key={level.id} onClick={() => navigate(`/course/${level.id}`)}
              className="w-full dark-card p-5 text-left group active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl shrink-0`}>
                  {level.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white group-hover:text-brand-300 transition-colors">{level.title}</h3>
                  <p className="text-xs text-white/40 mt-0.5">{level.hook}</p>
                  <p className="text-[11px] text-white/25 font-semibold mt-1">{level.stat}</p>
                </div>
                <span className="text-[11px] font-bold text-brand-300 bg-brand-500/15 px-3 py-1.5 rounded-full group-hover:bg-brand-500/25 transition-colors shrink-0">
                  {level.cta} →
                </span>
              </div>
            </button>
          ))}
          <a href="/courses" className="block text-center text-sm text-brand-300 font-bold hover:text-brand-200 py-3 transition-colors">
            View All Courses <ChevronRight size={14} className="inline" strokeWidth={3} />
          </a>
        </div>
      </section>


      {/* ══════════ ENGLISH TENSES ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">Grammar</p>
          <h2 className="font-extrabold text-xl text-white mt-1">English Grammar Ab Hogi Easy.</h2>
          <p className="text-white/40 text-sm mt-1">Grammar ko rules ki tarah ratne ke bajay, real sentences ke through samjho aur bolo.</p>
        </div>
        <div className="dark-card p-5 border-indigo-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-lg font-extrabold shrink-0">T</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm text-white">English Tenses</h3>
              <p className="text-xs text-white/40 mt-0.5">12 Tenses · 200+ Sentences · Grammar Tips</p>
            </div>
          </div>
          <div className="space-y-2 mb-4">
            {[
              { tense: 'Present', en: 'I go to work every day.', hi: 'Main roz kaam par jaata hoon.' },
              { tense: 'Past', en: 'I went to work yesterday.', hi: 'Main kal kaam par gaya.' },
              { tense: 'Future', en: 'I will go to work tomorrow.', hi: 'Main kal kaam par jaunga.' },
            ].map((ex) => (
              <div key={ex.tense} className="bg-white/[0.05] rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded">{ex.tense}</span>
                  <p className="text-sm font-semibold text-white flex-1">{ex.en}</p>
                </div>
                <p className="text-xs text-white/35 mt-1">{ex.hi}</p>
              </div>
            ))}
          </div>
          <a href="/tenses" className="w-full btn-premium bg-white/5 border border-white/10 text-white py-3.5 text-sm rounded-xl font-bold block text-center hover:bg-white/10 transition-colors">
            Explore All Tenses →
          </a>
        </div>
      </section>


      {/* ══════════ PREMIUM VALUE ══════════ */}
      {!subscription.active && (
        <section className="mb-12">
          <div className="text-center mb-6">
            <p className="dark-kicker">Full Access</p>
            <h2 className="font-extrabold text-xl text-white mt-1">Full Access Mein Kya Milega?</h2>
          </div>
          <div className="dark-card p-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '5,000+ Sentences', icon: BookOpen },
                { label: 'All Courses', icon: GraduationCap },
                { label: 'Grammar / 12 Tenses', icon: Award },
                { label: 'Listening Practice', icon: Volume2 },
                { label: 'Speaking Practice', icon: Mic },
                { label: 'Progress Tracking', icon: TrendingUp },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2.5 text-sm text-white/65">
                  <item.icon size={16} className="text-brand-400 shrink-0" strokeWidth={2} />
                  {item.label}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/35 mb-3">One-time payment · No auto-renewal · Pay once, learn forever</p>
              <button onClick={() => navigate('/pricing')}
                className="btn-premium btn-premium-gradient px-8 py-3.5 text-sm rounded-xl">
                Unlock Full Access →
              </button>
            </div>
          </div>
        </section>
      )}


      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="mb-12">
        <div className="text-center mb-6">
          <p className="dark-kicker">Social Proof</p>
          <h2 className="font-extrabold text-xl text-white mt-1">Learners Ko Kya Difference Dikha?</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`dark-card p-5 ${i === 1 ? 'sm:-translate-y-2 sm:shadow-[0_8px_32px_-8px_rgba(99,102,241,0.3)]' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.gradient} text-white flex items-center justify-center font-extrabold text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-sm text-white">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={11} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-sm text-white/60 leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ PRICING ══════════ */}
      {!subscription.active && (
        <section className="mb-12">
          <div className="text-center mb-6">
            <p className="dark-kicker">Pricing</p>
            <h2 className="font-extrabold text-xl text-white mt-1">Ek Baar Pay Karo. English Improve Karte Raho.</h2>
            <p className="text-white/40 text-sm mt-1">One-time payment · No auto-renewal · Full app access</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAN_LIST.map((plan) => (
              <div key={plan.id} className={`dark-card relative p-5 flex flex-col ${
                plan.id === 'one_year' ? '!border-brand-400/40 shadow-[0_0_0_1px_rgba(99,102,241,0.2),0_8px_32px_-8px_rgba(99,102,241,0.3)]' : ''
              }`}>
                {plan.id === 'one_year' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-brand-500 to-accent-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1">
                    <Sparkles size={10} strokeWidth={2.5} /> BEST VALUE
                  </div>
                )}
                <div className="mb-3">
                  <h3 className="font-extrabold text-white text-sm">{plan.name} Full Access</h3>
                  <p className="text-xs text-white/40 mt-0.5">One-time payment · No auto-renewal</p>
                </div>
                <div className="mb-3">
                  <span className="text-2xl font-extrabold text-white">₹{plan.amountRupees}</span>
                  <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wide mt-0.5">ONE TIME · {plan.durationLabel}</p>
                </div>
                <ul className="space-y-2 mb-5 flex-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-white/55">
                      <CheckCircle2 size={13} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { if (!user) { navigate('/login'); return; } navigate('/pricing'); }}
                  className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                    plan.id === 'one_year' ? 'btn-premium-gradient' : 'bg-white/5 border border-white/15 text-white hover:bg-white/10'
                  }`}>
                  {user ? `Get ${plan.durationLabel}` : 'Sign Up & Get Access'} <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { Icon: Shield, t: 'Secure Payment', d: 'UPI · Cards' },
              { Icon: Zap, t: 'Instant Access', d: 'Turant unlock' },
              { Icon: CreditCard, t: 'Pay Once', d: 'No hidden fees' },
            ].map(x => (
              <div key={x.t} className="dark-card-flat !rounded-xl px-2 py-3 text-center">
                <x.Icon size={16} className="text-white/45 mx-auto mb-1.5" strokeWidth={2} />
                <p className="text-xs font-bold text-white leading-tight">{x.t}</p>
                <p className="text-[10px] text-white/30 leading-tight mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* ══════════ FINAL CTA ══════════ */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-2xl text-white p-8 text-center"
          style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 40%, #7c3aed 70%, #a855f7 100%)' }}>
          <div className="absolute -right-8 -top-10 w-40 h-40 bg-white/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-10 bottom-0 w-32 h-32 bg-accent-500/30 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-xl font-extrabold relative">English samajhne se confidence nahi aata.</h3>
          <p className="text-white/80 text-sm mt-2 relative">English bolne ki practice se aata hai.</p>
          <p className="text-white/55 text-xs mt-1.5 relative">Roz 10–15 minute. Suno. Bolo. Improve Karo.</p>
          <button onClick={() => navigate('/free-trial')}
            className="btn-premium px-8 py-3.5 mt-5 text-sm bg-white text-brand-700 shadow-lg hover:bg-gray-50 relative">
            Start Free Trial →
          </button>
        </div>
      </section>


      {/* ══════════ FOOTER ══════════ */}
      <footer className="text-center pt-6 pb-2">
        <div className="dark-divider mb-4" />
        <div className="flex items-center justify-center gap-3 text-xs text-white/25 font-medium">
          <span className="inline-flex items-center gap-1">
            <Star size={11} fill="currentColor" strokeWidth={0} className="text-amber-400" />
            4.9 rated
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Shield size={11} strokeWidth={2} />
            Secure
          </span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Globe size={11} strokeWidth={2} />
            Made in India
          </span>
        </div>
        <p className="text-xs text-white/20 mt-4">
          Made with care by <span className="text-white/40 font-bold">Pankaj Upadhyay</span>
        </p>
        <p className="text-white/15 mt-0.5 text-xs">Suno · Bolo · Repeat</p>
      </footer>
    </div>
  );
}
