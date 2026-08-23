import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLAN_LIST } from '../config/plans';
import {
  Headphones, ArrowRight, Shield, Zap, CreditCard, Star,
  Volume2, Mic, CheckCircle2, ChevronRight, Globe,
  BookOpen, Sparkles, MessageCircle,
  GraduationCap,
  Check, Users
} from 'lucide-react';

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Homemaker · Jaipur', text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon.', initial: 'P', gradient: 'from-rose-400 to-pink-600' },
  { name: 'Rahul Verma', role: 'Student · Lucknow', text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Selection ho gayi!', initial: 'R', gradient: 'from-sky-400 to-blue-600' },
  { name: 'Anita Gupta', role: 'Teacher · Meerut', text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai.', initial: 'A', gradient: 'from-amber-400 to-orange-500' },
];

const FEATURES = [
  { label: 'Daily Sentences', desc: 'Rozana ke real-life sentences', icon: MessageCircle, gradient: 'from-blue-500/15 to-cyan-500/8', iconColor: 'text-blue-400', path: '/free-trial', featured: true },
  { label: 'Grammar', desc: '12 Tenses with examples', icon: BookOpen, gradient: 'from-indigo-500/15 to-purple-500/8', iconColor: 'text-indigo-400', path: '/tenses' },
  { label: 'Speaking Practice', desc: 'Bolkar practice karo', icon: Mic, gradient: 'from-pink-500/15 to-rose-500/8', iconColor: 'text-pink-400', path: '/free-trial' },
  { label: 'All Courses', desc: 'Structured learning paths', icon: GraduationCap, gradient: 'from-emerald-500/15 to-green-500/8', iconColor: 'text-emerald-400', path: '/courses' },
  { label: 'Listening', desc: 'Natural English audio', icon: Volume2, gradient: 'from-amber-500/15 to-orange-500/8', iconColor: 'text-amber-400', path: '/courses' },
];

const COURSE_LEVELS = [
  { id: 'beginner', title: 'Beginner English', hook: 'English samajhna aur bolna start karo.', stat: '725+ Sentences · 29 Lessons', cta: 'Start Beginner', emoji: '🌱', color: 'from-emerald-500/15 to-teal-500/8' },
  { id: 'intermediate', title: 'Intermediate English', hook: 'Basic English se fluent conversation tak.', stat: '350+ Sentences · 14 Lessons', cta: 'Continue Intermediate', emoji: '🚀', color: 'from-blue-500/15 to-indigo-500/8' },
  { id: 'advanced', title: 'Advanced English', hook: 'Natural aur confident English bolo.', stat: '300+ Sentences · 12 Lessons', cta: 'Explore Advanced', emoji: '🎯', color: 'from-purple-500/15 to-violet-500/8' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  return (
    <div className="space-y-0 pb-8 w-full max-w-full overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-14"
        style={{ background: 'linear-gradient(135deg, #07051a 0%, #100b2e 25%, #1a1145 45%, #2d1b69 65%, #4338ca 85%, #6366f1 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#6C4DFF]/15 rounded-full blur-[100px] pointer-events-none glow-pulse" />
        <div className="absolute -left-16 bottom-0 w-60 h-60 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative p-6 sm:p-10 lg:p-14">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">
            {/* Hero illustration — shows FIRST on mobile */}
            <div className="flex-1 w-full max-w-md lg:max-w-xl relative order-1 lg:order-2">
              <img
                src="/images/hero.webp"
                alt="SunoBolo — Indian students learning English with headphones and smartphone"
                className="w-full h-auto object-contain max-h-[260px] sm:max-h-[320px] lg:max-h-[480px] drop-shadow-[0_0_60px_rgba(108,77,255,0.25)]"
                loading="eager"
                width="600"
                height="500"
              />
            </div>

            {/* Text + CTAs — shows SECOND on mobile */}
            <div className="flex-1 text-center lg:text-left order-2 lg:order-1">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 mb-6 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/[0.08]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">India's #1 English Speaking Platform</span>
              </div>

              {/* Headline — large, confident */}
              <h1 className="text-[2.2rem] sm:text-[2.8rem] lg:text-[3.4rem] font-extrabold leading-[1.08] tracking-tight text-white">
                English Padhne Se Nahi,
                <span className="block mt-1 bg-gradient-to-r from-white via-brand-200 to-accent-300 bg-clip-text text-transparent">
                  Bolne Se Aati Hai.
                </span>
              </h1>

              <p className="text-white/50 text-base sm:text-lg leading-relaxed mt-5 max-w-lg mx-auto lg:mx-0">
                Roz sirf 10–15 minute. Suno. Bolo. Repeat karo.<br />
                Real-life English mein confidently baat karo.
              </p>

              {/* Sample sentence — product preview */}
              <div className="mt-6 bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] max-w-lg mx-auto lg:mx-0">
                <p className="text-[13px] font-semibold text-white/90 leading-snug">
                  "I can understand English, but I can't speak it confidently."
                </p>
                <p className="text-[12px] text-white/35 mt-1.5">
                  Mujhe Angrezi samajh aati hai, par main aatmavishwas se bol nahi paata.
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-white/[0.06] px-2.5 py-1 rounded-full">
                    <Volume2 size={10} strokeWidth={2.5} /> Listen
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-white/[0.06] px-2.5 py-1 rounded-full">
                    <Mic size={10} strokeWidth={2.5} /> Speak
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-white/60 bg-white/[0.06] px-2.5 py-1 rounded-full">
                    <Check size={10} strokeWidth={3} /> Improve
                  </span>
                </div>
              </div>

              {/* CTAs — strong hierarchy */}
              <div className="flex flex-wrap gap-3 mt-7 justify-center lg:justify-start">
                <button onClick={() => navigate('/free-trial')}
                  className="btn-premium px-7 py-4 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2)] hover:bg-gray-50">
                  <Headphones size={18} strokeWidth={2.5} />
                  Try 25 Free Sentences
                  <ArrowRight size={16} strokeWidth={2.5} />
                </button>
                <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-premium btn-premium-ghost px-6 py-4 text-[15px]">
                  See How It Works
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex items-center gap-5 mt-5 justify-center lg:justify-start">
                {['No credit card', 'No login required', '25 free sentences'].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/40 font-medium">
                    <Check size={13} className="text-emerald-400/80" strokeWidth={3} />
                    {t}
                  </span>
                ))}
              </div>
            </div>


          </div>

          {/* Social proof bar */}
          <div className="mt-10 pt-6 border-t border-white/[0.05] flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8">
            {[
              { value: '10,000+', label: 'Learners' },
              { value: '5,000+', label: 'Sentences' },
              { value: '4.9', label: 'Rating', icon: Star },
              { value: '100%', label: 'Free Trial' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2">
                {s.icon && <s.icon size={14} className="text-amber-400" fill="currentColor" strokeWidth={0} />}
                <span className="text-white font-extrabold text-sm">{s.value}</span>
                <span className="text-white/35 text-xs">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════ HOW SUNOBOLO WORKS — 3 STEPS ══════════ */}
      <section id="how-it-works" className="mb-14">
        <div className="text-center mb-8">
          <p className="dark-kicker mb-2">SunoBolo Method</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white">Sirf 3 Steps. Roz 10–15 Min.</h2>
          <p className="text-white/40 text-sm mt-2 max-w-md mx-auto">English seekhne ka sabse aasan tarika</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: '01', title: 'Suno', emoji: '🎧', desc: 'Natural Indian English audio suno — har sentence ko 3 baar clear voice mein suno.', gradient: 'from-[#6C4DFF] to-blue-500', glow: 'shadow-[0_8px_32px_-8px_rgba(108,77,255,0.4)]' },
            { step: '02', title: 'Bolo', emoji: '🎤', desc: 'Khud bolkar practice karo — sentence ko 3 baar zor se bolo aur accent improve karo.', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_32px_-8px_rgba(236,72,153,0.4)]' },
            { step: '03', title: 'Use Karo', emoji: '💬', desc: 'Real life mein use karo — jo seekha hai wo conversation mein lagao aur confident bano.', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)]' },
          ].map((s, i) => (
            <div key={s.step} className="dark-card p-7 text-center relative group">
              {/* Step number */}
              <div className={`relative w-18 h-18 mx-auto rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-5 ${s.glow} group-hover:scale-105 transition-transform`}>
                <span className="text-3xl">{s.emoji}</span>
                <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white/10 border border-white/15 text-[11px] font-extrabold text-white flex items-center justify-center backdrop-blur-sm">
                  {s.step}
                </span>
              </div>
              <h3 className="font-extrabold text-xl text-white mb-2">{s.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{s.desc}</p>
              {/* Connecting arrow on desktop */}
              {i < 2 && <div className="hidden sm:block absolute top-1/2 -right-2 w-4 text-white/15 text-lg">→</div>}
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ EXPLORE & LEARN — BENTO ══════════ */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <p className="dark-kicker mb-2">Explore & Learn</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white">Kya Seekhna Chahte Ho?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Featured — large Daily Sentences card */}
          <button onClick={() => navigate('/free-trial')}
            className="dark-card col-span-2 sm:col-span-1 p-6 text-left group active:scale-[0.99] bg-gradient-to-br from-[#6C4DFF]/12 to-accent-500/6 border-[#6C4DFF]/15">
            <div className="w-14 h-14 rounded-2xl bg-[#6C4DFF]/15 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              <Headphones size={28} className="text-brand-300" strokeWidth={2} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">Daily Sentences</h3>
            <p className="text-sm text-white/40">Rozana ke real-life English sentences — 25 free</p>
            <div className="mt-4 flex items-center gap-1.5 text-brand-300 text-sm font-bold group-hover:gap-2.5 transition-all">
              Start Free <ArrowRight size={14} strokeWidth={2.5} />
            </div>
          </button>

          {/* Smaller feature cards */}
          {FEATURES.filter(f => !f.featured).map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`dark-card p-5 text-left bg-gradient-to-br ${item.gradient} active:scale-[0.97] group`}>
              <div className="w-11 h-11 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <item.icon size={22} className={item.iconColor} strokeWidth={2} />
              </div>
              <h3 className="text-sm font-bold text-white">{item.label}</h3>
              <p className="text-[12px] text-white/35 mt-1">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ FREE TRIAL — CONVERSION ══════════ */}
      <section className="mb-14">
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10"
          style={{ background: 'linear-gradient(135deg, #100b2e 0%, #1a1145 30%, #2d1b69 55%, #4338ca 80%, #6366f1 100%)' }}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.06] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-40 h-40 bg-accent-500/15 rounded-full blur-[50px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1">
              <p className="dark-kicker mb-2">Try First</p>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white mb-2">Pehle Try Karo. Phir Decide Karo.</h2>
              <p className="text-white/45 text-sm mb-5">25 Real-Life English Sentences — Completely Free</p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {['25 real-life sentences', 'Natural audio', 'Hindi meaning', 'Speaking practice', 'No payment', 'No login'].map((f) => (
                  <div key={f} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                    {f}
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/free-trial')}
                className="btn-premium px-8 py-4 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.15)] hover:bg-gray-50">
                Start Free Trial <ArrowRight size={16} strokeWidth={2.5} />
              </button>
            </div>

            {/* Visual preview of practice */}
            <div className="hidden sm:block w-56 shrink-0">
              <div className="bg-white/[0.06] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06]">
                <div className="text-center mb-4">
                  <p className="text-[10px] font-bold text-brand-300 uppercase tracking-wider mb-2">Sentence 1 of 25</p>
                  <p className="text-lg font-bold text-white leading-snug">"I am learning English."</p>
                  <p className="text-[12px] text-white/35 mt-1">Main Angrezi seekh raha hoon.</p>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#6C4DFF]/20 rounded-xl py-2.5 text-center text-xs font-bold text-brand-300">🎧 Listen</div>
                  <div className="flex-1 bg-pink-500/15 rounded-xl py-2.5 text-center text-xs font-bold text-pink-300">🎤 Speak</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════ COURSE LEVELS ══════════ */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <p className="dark-kicker mb-2">Structured Courses</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white">Apne Level Se Start Karo</h2>
        </div>
        <div className="space-y-3">
          {COURSE_LEVELS.map((level) => (
            <button key={level.id} onClick={() => navigate(`/course/${level.id}`)}
              className="w-full dark-card p-5 sm:p-6 text-left group active:scale-[0.99]">
              <div className="flex items-center gap-5">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-3xl shrink-0 group-hover:scale-105 transition-transform`}>
                  {level.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-white text-lg group-hover:text-brand-300 transition-colors">{level.title}</h3>
                  <p className="text-sm text-white/40 mt-0.5">{level.hook}</p>
                  <p className="text-[12px] text-white/25 font-semibold mt-1.5">{level.stat}</p>
                </div>
                <span className="text-[12px] font-bold text-brand-300 bg-[#6C4DFF]/10 px-4 py-2 rounded-full group-hover:bg-[#6C4DFF]/20 transition-colors shrink-0">
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


      {/* ══════════ 30-DAY GRAMMAR JOURNEY — MAIN CTA ══════════ */}
      <section className="mb-14">
        <button onClick={() => navigate('/journey')}
          className="w-full relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left group active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #07051a 0%, #100b2e 20%, #1a1145 40%, #2d1b69 60%, #4338ca 80%, #6366f1 100%)' }}>
          {/* Ambient glow */}
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-white/[0.06] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-48 h-48 bg-accent-500/10 rounded-full blur-[50px] pointer-events-none" />
          <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

          <div className="relative">
            {/* Top badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">30-Day Course</span>
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-full">Day 1 FREE</span>
            </div>

            {/* Headline */}
            <h2 className="text-[1.6rem] sm:text-[2rem] font-extrabold leading-tight text-white mb-2">
              🎯 30-Day English Grammar Journey
            </h2>
            <p className="text-white/50 text-sm sm:text-base leading-relaxed mb-4">
              Roz sirf 15–20 minutes. Grammar step-by-step seekho, sentences bolo, practice karo aur har din next level unlock karo.
            </p>

            {/* Progress preview */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold text-white/60">DAY</span>
                <span className="text-xl font-extrabold text-white">1</span>
                <span className="text-xs text-white/30">→</span>
                <span className="text-xl font-extrabold text-white">30</span>
              </div>
              <div className="h-2 flex-1 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full w-0 bg-gradient-to-r from-brand-500 to-accent-500 rounded-full" />
              </div>
              <span className="text-xs font-bold text-white/40">0/30</span>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {['📘 Grammar', '🎧 Listen', '🗣️ Speak', '✍️ Practice', '📝 Test'].map(f => (
                <span key={f} className="text-[11px] font-semibold text-white/50 bg-white/[0.06] border border-white/[0.06] px-3 py-1.5 rounded-full">{f}</span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <span className="btn-premium btn-premium-gradient px-8 py-4 text-sm font-bold flex items-center justify-center gap-2">
                Start Day 1 — FREE
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </span>
              <span className="text-[11px] text-white/30 font-medium text-center sm:text-left">
                Day 1 free · No payment required
              </span>
            </div>
          </div>
        </button>
      </section>


      {/* ══════════ 30-DAY GRAMMAR JOURNEY — MINI CARDS (placed below main CTA) ══════════ */}
      <section className="mb-14">
        <div className="grid grid-cols-3 gap-2">
          {[
            { emoji: '📘', label: '12 Tenses', sub: 'Step-by-step' },
            { emoji: '🎧', label: 'Listen & Speak', sub: 'Real sentences' },
            { emoji: '📝', label: 'Daily Tests', sub: 'Track progress' },
          ].map(c => (
            <button key={c.label} onClick={() => navigate('/journey')} className="dark-card p-4 text-center group active:scale-[0.97]">
              <span className="text-2xl block mb-2">{c.emoji}</span>
              <p className="text-xs font-bold text-white">{c.label}</p>
              <p className="text-[10px] text-white/35 mt-0.5">{c.sub}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ GRAMMAR ══════════ */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <p className="dark-kicker mb-2">Grammar</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white">English Grammar Ab Hogi Easy.</h2>
          <p className="text-white/35 text-sm mt-2 max-w-md mx-auto">Grammar ko rules ki tarah ratne ke bajay, real sentences ke through samjho aur bolo.</p>
        </div>
        <div className="dark-card p-6 border-indigo-500/10">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C4DFF] to-purple-600 flex items-center justify-center text-white text-xl font-extrabold shrink-0 shadow-[0_4px_16px_-4px_rgba(108,77,255,0.4)]">T</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-extrabold text-white text-lg">English Tenses</h3>
              <p className="text-sm text-white/40 mt-0.5">12 Tenses · 200+ Sentences · Grammar Tips</p>
            </div>
          </div>
          <div className="space-y-2.5 mb-5">
            {[
              { tense: 'Present', en: 'I go to work every day.', hi: 'Main roz kaam par jaata hoon.' },
              { tense: 'Past', en: 'I went to work yesterday.', hi: 'Main kal kaam par gaya.' },
              { tense: 'Future', en: 'I will go to work tomorrow.', hi: 'Main kal kaam par jaunga.' },
            ].map((ex) => (
              <div key={ex.tense} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                  <span className="text-[11px] font-extrabold text-indigo-300 bg-[#6C4DFF]/15 px-2.5 py-0.5 rounded-md">{ex.tense}</span>
                  <p className="text-[15px] font-semibold text-white flex-1">{ex.en}</p>
                </div>
                <p className="text-[13px] text-white/30 mt-1.5 ml-[52px]">{ex.hi}</p>
              </div>
            ))}
          </div>
          <a href="/tenses" className="w-full btn-premium bg-white/[0.04] border border-white/[0.06] text-white py-3.5 text-sm rounded-xl font-bold block text-center hover:bg-white/[0.08] transition-colors">
            Explore All Tenses →
          </a>
        </div>
      </section>


      {/* ══════════ SOCIAL PROOF — TESTIMONIALS ══════════ */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <p className="dark-kicker mb-2">Social Proof</p>
          <h2 className="font-extrabold text-2xl sm:text-3xl text-white">Learners Ko Kya Difference Dikha?</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`dark-card p-6 ${i === 1 ? 'sm:-translate-y-2 sm:shadow-[0_12px_40px_-12px_rgba(108,77,255,0.25)] sm:border-[#6C4DFF]/20' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} text-white flex items-center justify-center font-extrabold text-base shrink-0`}>
                  {t.initial}
                </div>
                <div>
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-[12px] text-white/35">{t.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-0.5 text-amber-400 mb-3">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-[15px] text-white/55 leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ PRICING ══════════ */}
      {!subscription.active && (
        <section className="mb-14">
          <div className="text-center mb-8">
            <p className="dark-kicker mb-2">Pricing</p>
            <h2 className="font-extrabold text-2xl sm:text-3xl text-white">Ek Baar Pay Karo. English Improve Karte Raho.</h2>
            <p className="text-white/35 text-sm mt-2">One-time payment · No auto-renewal · Full app access</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {PLAN_LIST.map((plan) => (
              <div key={plan.id} className={`dark-card relative p-6 flex flex-col ${
                plan.id === 'one_year' ? '!border-[#6C4DFF]/30 shadow-[0_0_0_1px_rgba(108,77,255,0.15),0_12px_40px_-12px_rgba(108,77,255,0.25)]' : ''
              }`}>
                {plan.id === 'one_year' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C4DFF] to-accent-500 text-white text-[11px] font-extrabold px-4 py-1.5 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap flex items-center gap-1.5">
                    <Sparkles size={11} strokeWidth={2.5} /> BEST VALUE
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="font-extrabold text-white text-lg">{plan.name}</h3>
                  <p className="text-[13px] text-white/35 mt-0.5">One-time payment · No auto-renewal</p>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-extrabold text-white">₹{plan.amountRupees}</span>
                  <p className="text-[11px] text-white/25 font-semibold uppercase tracking-wide mt-1">{plan.durationLabel}</p>
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-[14px] text-white/55">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => { if (!user) { navigate('/login'); return; } navigate('/pricing'); }}
                  className={`btn-premium w-full py-3.5 text-sm font-bold rounded-xl ${
                    plan.id === 'one_year' ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                  }`}>
                  {user ? `Get ${plan.durationLabel}` : 'Sign Up & Get Access'} <ArrowRight size={14} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { Icon: Shield, t: 'Secure Payment', d: 'UPI · Cards' },
              { Icon: Zap, t: 'Instant Access', d: 'Turant unlock' },
              { Icon: CreditCard, t: 'Pay Once', d: 'No hidden fees' },
              { Icon: Users, t: '10,000+ Learners', d: 'Trust SunoBolo' },
            ].map(x => (
              <div key={x.t} className="dark-card-flat !rounded-xl px-3 py-3.5 text-center">
                <x.Icon size={18} className="text-white/40 mx-auto mb-1.5" strokeWidth={2} />
                <p className="text-[12px] font-bold text-white leading-tight">{x.t}</p>
                <p className="text-[10px] text-white/25 mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* ══════════ FINAL CTA ══════════ */}
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl p-8 sm:p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4338ca 35%, #6366f1 60%, #7C3AED 80%, #a855f7 100%)' }}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-36 h-36 bg-accent-500/20 rounded-full blur-[50px] pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-extrabold relative text-white">English samajhne se confidence nahi aata.</h3>
          <p className="text-white/75 text-base mt-2 relative">English bolne ki practice se aata hai.</p>
          <p className="text-white/50 text-sm mt-1.5 relative">Roz 10–15 minute. Suno. Bolo. Improve Karo.</p>
          <button onClick={() => navigate('/free-trial')}
            className="btn-premium px-8 py-4 mt-6 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2)] hover:bg-gray-50 relative">
            Start Free Trial →
          </button>
        </div>
      </section>


      {/* ══════════ FOOTER ══════════ */}
      <footer className="text-center pt-8 pb-4">
        <div className="dark-divider mb-5" />
        <div className="flex items-center justify-center gap-4 text-[13px] text-white/25 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Star size={12} fill="currentColor" strokeWidth={0} className="text-amber-400" />
            4.9 rated
          </span>
          <span className="text-white/10">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Shield size={12} strokeWidth={2} />
            Secure
          </span>
          <span className="text-white/10">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Globe size={12} strokeWidth={2} />
            Made in India
          </span>
        </div>
      </footer>
    </div>
  );
}
