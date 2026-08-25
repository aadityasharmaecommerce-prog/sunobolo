import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { PLAN_LIST } from '../config/plans';
import {
  Headphones, ArrowRight, Shield, Zap, CreditCard, Star,
  Volume2, Mic, CheckCircle2, ChevronRight, Globe,
  BookOpen, MessageCircle,
  GraduationCap,
  Check, Users, Flame
} from 'lucide-react';


interface ActiveOffer {
  id: string;
  name: string;
  label: string;
  plan_id: string;
  mrp: number;
  discountPercent: number;
  salePrice: number;
  startAt: string;
  endAt: string;
}

const TESTIMONIALS = [
  { name: 'Priya Sharma', role: 'Homemaker · Jaipur', text: 'Roz 15 minute practice se ab main market mein confidently English bolti hoon. Meri beti bhi ab mere saath bolti hai!', initial: 'P', gradient: 'from-rose-400 to-pink-600', highlight: 'Confidence badha' },
  { name: 'Rahul Verma', role: 'Student · Lucknow', text: 'Interview ke liye tayari ki — Suno 3 baar, Bolo 3 baar method kaam karta hai. Selection ho gayi! Ab main MNC mein kaam karta hoon.', initial: 'R', gradient: 'from-sky-400 to-blue-600', highlight: 'Job lag gayi' },
  { name: 'Anita Gupta', role: 'Teacher · Meerut', text: 'Hindi meaning ke saath samajh aata hai aur same voice sun sun ke accent improve hota hai. Bachon ko bhi recommend karti hoon.', initial: 'A', gradient: 'from-amber-400 to-orange-500', highlight: 'Accent improve' },
];

const COURSE_LEVELS = [
  { id: 'beginner', title: 'Beginner English', hook: 'English samajhna aur bolna start karo.', stat: '725+ Sentences · 29 Lessons', cta: 'Start Beginner', emoji: '🌱', color: 'from-emerald-500/15 to-teal-500/8' },
  { id: 'intermediate', title: 'Intermediate English', hook: 'Basic English se fluent conversation tak.', stat: '350+ Sentences · 14 Lessons', cta: 'Continue Intermediate', emoji: '🚀', color: 'from-blue-500/15 to-indigo-500/8' },
  { id: 'advanced', title: 'Advanced English', hook: 'Natural aur confident English bolo.', stat: '300+ Sentences · 12 Lessons', cta: 'Explore Advanced', emoji: '🎯', color: 'from-purple-500/15 to-violet-500/8' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const [activeOffers, setActiveOffers] = useState<Record<string, ActiveOffer>>({});

  useEffect(() => {
    fetch('/api/offers/active')
      .then(r => r.json())
      .then(data => { if (data.offers) setActiveOffers(data.offers); })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-0 pb-8 w-full max-w-full overflow-x-hidden">

      {/* ══════════ HERO — 6 Second Rule ══════════ */}
      <section className="relative rounded-3xl overflow-hidden mb-8"
        style={{ background: 'linear-gradient(135deg, #07051a 0%, #100b2e 25%, #1a1145 45%, #2d1b69 65%, #4338ca 85%, #6366f1 100%)' }}>
        {/* Ambient glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#6C4DFF]/15 rounded-full blur-[100px] pointer-events-none glow-pulse" />
        <div className="absolute -left-16 bottom-0 w-60 h-60 bg-accent-500/10 rounded-full blur-[80px] pointer-events-none glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.025]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

        <div className="relative p-6 sm:p-10 lg:p-14">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14">

            {/* Left: Image — mobile: top, desktop: left side */}
            <div className="w-full lg:flex-1 flex justify-center order-1 lg:order-1">
              <img
                src="/images/hero.webp"
                alt="SunoBolo — Indian students learning English with headphones and smartphone"
                className="w-full max-w-[280px] sm:max-w-[340px] lg:max-w-[420px] h-auto object-contain drop-shadow-[0_0_60px_rgba(108,77,255,0.25)]"
                loading="eager"
                width="600"
                height="500"
              />
            </div>

            {/* Right: Text — mobile: bottom, desktop: right side */}
            <div className="w-full lg:flex-1 order-2 lg:order-2">
              {/* Pill badge */}
              <div className="flex justify-center lg:justify-start mb-4">
                <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-sm rounded-full px-4 py-2 border border-white/[0.08]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[11px] font-bold text-white/70 uppercase tracking-wider">Learn English with Confidence</span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-[2rem] sm:text-[2.6rem] lg:text-[3rem] font-extrabold leading-[1.08] tracking-tight text-white text-center lg:text-left">
                English Bolna Seekho
                <span className="block mt-1 text-gradient-premium">
                  Suno. Bolo. Improve.
                </span>
              </h1>

              {/* One-liner */}
              <p className="text-white/55 text-base sm:text-lg leading-relaxed mt-4 max-w-lg mx-auto lg:mx-0 text-center lg:text-left">
                Roz sirf <strong className="text-white/80">10–15 minute</strong> suno aur bolo.<br />
                Hindi meaning ke saath samjho. <strong className="text-white/80">Confident</strong> English bolo.
              </p>

              {/* Sample sentence */}
              <div className="mt-5 bg-white/[0.05] backdrop-blur-sm rounded-2xl p-5 border border-white/[0.06] max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-brand-300 bg-[#6C4DFF]/15 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Preview</span>
                </div>
                <p className="text-[15px] font-semibold text-white/90 leading-snug">
                  "I can understand English, but I can't speak it confidently."
                </p>
                <p className="text-[13px] text-white/35 mt-1.5">
                  Mujhe Angrezi samajh aati hai, par main aatmavishwas se bol nahi paata.
                </p>
                <div className="flex items-center gap-2.5 mt-3">
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

              {/* CTAs */}
              <div className="flex flex-wrap gap-3 mt-6 justify-center lg:justify-start">
                {subscription.active ? (
                  <button onClick={() => navigate('/courses')}
                    className="btn-premium px-8 py-4 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2)] hover:bg-gray-50">
                    <GraduationCap size={18} strokeWidth={2.5} />
                    Continue Learning
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                ) : (
                  <button onClick={() => navigate('/free-trial')}
                    className="btn-premium px-8 py-4 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2)] hover:bg-gray-50">
                    <Headphones size={18} strokeWidth={2.5} />
                    Free Try Karo — 25 Sentences
                    <ArrowRight size={16} strokeWidth={2.5} />
                  </button>
                )}
              </div>

              {/* Trust indicators */}
              {!subscription.active && (
                <div className="flex items-center gap-4 mt-4 justify-center lg:justify-start flex-wrap">
                  {['No credit card', 'No login', '25 free sentences'].map(t => (
                    <span key={t} className="flex items-center gap-1.5 text-[12px] text-white/40 font-medium">
                      <Check size={13} className="text-emerald-400/80" strokeWidth={3} />
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Social proof bar — instant trust */}
          <div className="mt-8 pt-6 border-t border-white/[0.05] flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8">
            {[
              { value: '5,000+', label: 'Sentences' },
              { value: '15+', label: 'Courses' },
              { value: '₹9/day', label: 'se start' },
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


      {/* ══════════ 4 BENEFITS — What You Get ══════════ */}
      <section className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '🎧', title: 'Premium Voice', desc: 'Sarvam AI se natural Indian English audio', gradient: 'from-[#6C4DFF]/15 to-blue-500/8' },
            { emoji: '🇮🇳', title: 'Hindi Meaning', desc: 'Har sentence ka Hindi mein matlab', gradient: 'from-emerald-500/15 to-green-500/8' },
            { emoji: '🗣️', title: 'Speak Practice', desc: '3 baar repeat karo — accent improve hoga', gradient: 'from-pink-500/15 to-rose-500/8' },
            { emoji: '📖', title: 'Daily Reading', desc: 'Interesting stories padho — English seekho', gradient: 'from-orange-500/15 to-amber-500/8' },
          ].map(item => (
            <div key={item.title} className={`glass-card p-4 text-center bg-gradient-to-br ${item.gradient} animate-fade-up`}>
              <span className="text-2xl mb-2 block">{item.emoji}</span>
              <p className="text-[13px] font-extrabold text-white">{item.title}</p>
              <p className="text-[11px] text-white/35 mt-0.5 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ HOW IT WORKS — 3 Steps ══════════ */}
      <section id="how-it-works" className="mb-10">
        <div className="text-center mb-6">
          <h2 className="font-extrabold text-xl sm:text-2xl text-white">Kaise Kaam Karta Hai?</h2>
          <p className="text-white/40 text-sm mt-1.5">Sirf 3 steps. Roz 10–15 minute.</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: '01', title: 'Suno', emoji: '🎧', desc: 'Natural English audio suno — 3 baar', gradient: 'from-[#6C4DFF] to-blue-500', glow: 'shadow-[0_8px_32px_-8px_rgba(108,77,255,0.4)]' },
            { step: '02', title: 'Bolo', emoji: '🎤', desc: 'Khud bolo — accent improve karo', gradient: 'from-pink-500 to-rose-500', glow: 'shadow-[0_8px_32px_-8px_rgba(236,72,153,0.4)]' },
            { step: '03', title: 'Improve', emoji: '🚀', desc: 'Real life mein confidently bolo', gradient: 'from-emerald-500 to-green-500', glow: 'shadow-[0_8px_32px_-8px_rgba(16,185,129,0.4)]' },
          ].map((s, i) => (
            <div key={s.step} className="dark-card p-5 text-center relative group">
              <div className={`relative w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center mb-4 ${s.glow} group-hover:scale-105 transition-transform`}>
                <span className="text-2xl">{s.emoji}</span>
                <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold text-white flex items-center justify-center backdrop-blur-sm">
                  {s.step}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-white mb-1">{s.title}</h3>
              <p className="text-[12px] text-white/40 leading-snug">{s.desc}</p>
              {i < 2 && <div className="hidden sm:block absolute top-1/2 -right-2 w-4 text-white/15 text-lg">→</div>}
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ FREE TRIAL — Main Conversion ══════════ */}
      {!subscription.active && (
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10"
          style={{ background: 'linear-gradient(135deg, #100b2e 0%, #1a1145 30%, #2d1b69 55%, #4338ca 80%, #6366f1 100%)' }}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/[0.06] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-40 h-40 bg-accent-500/15 rounded-full blur-[50px] pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">FREE</span>
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-full">No Login Needed</span>
              </div>
              <h2 className="font-extrabold text-2xl sm:text-3xl text-white mb-2">Pehle Try Karo. Phir Decide Karo.</h2>
              <p className="text-white/50 text-sm mb-5">25 Real-Life English Sentences — Completely Free</p>

              <div className="grid grid-cols-2 gap-2.5 mb-6">
                {['25 real-life sentences', 'Premium Sarvam AI voice', 'Hindi meaning', 'Speak practice', 'No payment needed', 'No login required'].map((f) => (
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

            {/* Visual preview */}
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
      )}


      {/* ══════════ EXPLORE — Quick Access Grid ══════════ */}
      <section className="mb-10">
        <div className="text-center mb-5">
          <h2 className="font-extrabold text-xl sm:text-2xl text-white">Kya Seekhna Chahte Ho?</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Featured card */}
          {subscription.active ? (
            <button onClick={() => navigate('/journey')}
              className="dark-card col-span-2 sm:col-span-1 p-5 text-left group active:scale-[0.99] bg-gradient-to-br from-[#6C4DFF]/12 to-accent-500/6 border-[#6C4DFF]/15">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DFF]/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <GraduationCap size={24} className="text-brand-300" strokeWidth={2} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">30-Day Journey</h3>
              <p className="text-[12px] text-white/40">Grammar step-by-step seekho</p>
              <div className="mt-3 flex items-center gap-1.5 text-brand-300 text-sm font-bold group-hover:gap-2.5 transition-all">
                Continue <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </button>
          ) : (
            <button onClick={() => navigate('/free-trial')}
              className="dark-card col-span-2 sm:col-span-1 p-5 text-left group active:scale-[0.99] bg-gradient-to-br from-[#6C4DFF]/12 to-accent-500/6 border-[#6C4DFF]/15">
              <div className="w-12 h-12 rounded-2xl bg-[#6C4DFF]/15 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Headphones size={24} className="text-brand-300" strokeWidth={2} />
              </div>
              <h3 className="text-base font-extrabold text-white mb-1">Daily Sentences</h3>
              <p className="text-[12px] text-white/40">25 free real-life sentences</p>
              <div className="mt-3 flex items-center gap-1.5 text-brand-300 text-sm font-bold group-hover:gap-2.5 transition-all">
                Start Free <ArrowRight size={14} strokeWidth={2.5} />
              </div>
            </button>
          )}

          {/* Quick access cards */}
          {[
            { label: 'Daily Reading', desc: 'Stories padho', icon: BookOpen, gradient: 'from-orange-500/15 to-amber-500/8', iconColor: 'text-orange-400', path: '/reading' },
            { label: 'Grammar', desc: '12 Tenses', icon: MessageCircle, gradient: 'from-indigo-500/15 to-purple-500/8', iconColor: 'text-indigo-400', path: '/tenses' },
            { label: 'Speaking Practice', desc: 'Bolkar practice', icon: Mic, gradient: 'from-pink-500/15 to-rose-500/8', iconColor: 'text-pink-400', path: subscription.active ? '/courses' : '/free-trial' },
            { label: 'All Courses', desc: 'Structured paths', icon: GraduationCap, gradient: 'from-emerald-500/15 to-green-500/8', iconColor: 'text-emerald-400', path: '/courses' },
          ].map((item) => (
            <button key={item.label} onClick={() => navigate(item.path)}
              className={`dark-card p-4 text-left bg-gradient-to-br ${item.gradient} active:scale-[0.97] group`}>
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
                <item.icon size={20} className={item.iconColor} strokeWidth={2} />
              </div>
              <h3 className="text-[13px] font-bold text-white">{item.label}</h3>
              <p className="text-[11px] text-white/35 mt-0.5">{item.desc}</p>
            </button>
          ))}
        </div>
      </section>


      {/* ══════════ COURSE LEVELS ══════════ */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className="font-extrabold text-xl sm:text-2xl text-white">Apne Level Se Start Karo</h2>
          <p className="text-white/35 text-sm mt-1.5">Beginner ho ya advanced — sabke liye kuch hai</p>
        </div>
        <div className="space-y-3">
          {COURSE_LEVELS.map((level) => (
            <button key={level.id} onClick={() => navigate(`/course/${level.id}`)}
              className="w-full dark-card p-5 text-left group active:scale-[0.99]">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${level.color} flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform`}>
                  {level.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-white text-base group-hover:text-brand-300 transition-colors">{level.title}</h3>
                  <p className="text-[13px] text-white/40 mt-0.5">{level.hook}</p>
                  <p className="text-[11px] text-white/25 font-semibold mt-1">{level.stat}</p>
                </div>
                <span className="text-[11px] font-bold text-brand-300 bg-[#6C4DFF]/10 px-3 py-1.5 rounded-full group-hover:bg-[#6C4DFF]/20 transition-colors shrink-0">
                  {level.cta} →
                </span>
              </div>
            </button>
          ))}
          <Link to="/courses" className="block text-center text-sm text-brand-300 font-bold hover:text-brand-200 py-2 transition-colors">
            View All Courses <ChevronRight size={14} className="inline" strokeWidth={3} />
          </Link>
        </div>
      </section>


      {/* ══════════ 30-DAY GRAMMAR JOURNEY — CTA ══════════ */}
      <section className="mb-10">
        <button onClick={() => navigate('/journey')}
          className="w-full relative overflow-hidden rounded-3xl p-6 sm:p-8 text-left group active:scale-[0.99]"
          style={{ background: 'linear-gradient(135deg, #07051a 0%, #100b2e 20%, #1a1145 40%, #2d1b69 60%, #4338ca 80%, #6366f1 100%)' }}>
          <div className="absolute -right-16 -top-16 w-60 h-60 bg-white/[0.06] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-48 h-48 bg-accent-500/10 rounded-full blur-[50px] pointer-events-none" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">30-Day Course</span>
              <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/15 border border-amber-500/20 px-2.5 py-1 rounded-full">Day 1 FREE</span>
            </div>

            <h2 className="text-[1.5rem] sm:text-[1.8rem] font-extrabold leading-tight text-white mb-2">
              🎯 30-Day English Grammar Journey
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-4">
              Roz 15–20 minute. Grammar step-by-step seekho aur har din next level unlock karo.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {['📘 Grammar', '🎧 Listen', '🗣️ Speak', '✍️ Practice', '📝 Test'].map(f => (
                <span key={f} className="text-[11px] font-semibold text-white/50 bg-white/[0.06] border border-white/[0.06] px-3 py-1.5 rounded-full">{f}</span>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <span className="btn-premium btn-premium-gradient px-7 py-3.5 text-sm font-bold flex items-center justify-center gap-2">
                Start Day 1 — FREE
                <ArrowRight size={14} strokeWidth={2.5} />
              </span>
              <span className="text-[11px] text-white/30 font-medium">
                No payment required
              </span>
            </div>
          </div>
        </button>
      </section>


      {/* ══════════ WHAT YOU GET — Full Access ══════════ */}
      {!subscription.active && (
      <section className="mb-10">
        <div className="glass-card p-6 sm:p-7 border-[#6C4DFF]/15 glow-ring">
          <div className="text-center mb-5">
            <h2 className="font-extrabold text-xl sm:text-2xl text-white">Subscription Mein Kya Milega?</h2>
            <p className="text-white/35 text-sm mt-1">Ek baar pay karo. Full access pao.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { emoji: '🎧', title: '5,000+ Sentences', desc: 'Premium Sarvam AI voice' },
              { emoji: '📘', title: '12 Tenses', desc: 'Complete grammar course' },
              { emoji: '🎯', title: '30-Day Journey', desc: 'Step-by-step grammar' },
              { emoji: '📖', title: 'Daily Reading', desc: 'Interesting stories daily' },
              { emoji: '🎤', title: 'Speaking Practice', desc: 'Bolkar improve karo' },
              { emoji: '📊', title: 'Progress Tracking', desc: 'Apna progress dekho' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/[0.04]">
                <span className="text-xl shrink-0">{item.emoji}</span>
                <div>
                  <p className="text-[13px] font-bold text-white">{item.title}</p>
                  <p className="text-[11px] text-white/35">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}


      {/* ══════════ SOCIAL PROOF — Testimonials ══════════ */}
      <section className="mb-10">
        <div className="text-center mb-6">
          <h2 className="font-extrabold text-xl sm:text-2xl text-white">Learners Ko Kya Difference Dikha?</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className={`dark-card p-5 ${i === 1 ? 'sm:-translate-y-1 sm:shadow-[0_12px_40px_-12px_rgba(108,77,255,0.25)] sm:border-[#6C4DFF]/20' : ''}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} text-white flex items-center justify-center font-extrabold text-sm shrink-0`}>
                  {t.initial}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-white text-sm">{t.name}</p>
                  <p className="text-[11px] text-white/35">{t.role}</p>
                </div>
                {t.highlight && (
                  <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-300 text-[10px] font-bold rounded-full border border-emerald-500/20 shrink-0">{t.highlight}</span>
                )}
              </div>
              <div className="flex items-center gap-0.5 text-amber-400 mb-2">
                {[1,2,3,4,5].map(s => <Star key={s} size={11} fill="currentColor" strokeWidth={0} />)}
              </div>
              <p className="text-[13px] text-white/55 leading-relaxed">"{t.text}"</p>
            </div>
          ))}
        </div>
      </section>


      {/* ══════════ PRICING ══════════ */}
      {!subscription.active && (
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="font-extrabold text-xl sm:text-2xl text-white">Pricing — Simple aur Clear</h2>
            <p className="text-white/35 text-sm mt-1.5">One-time payment · No auto-renewal · Full app access</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PLAN_LIST.map((plan) => {
              const offer = activeOffers[plan.id];
              const hasOffer = !!offer;
              const isPopular = plan.id === 'six_month';
              const planBadge = plan.badge;

              return (
                <div key={plan.id} className={`dark-card relative p-5 flex flex-col ${
                  isPopular ? '!border-[#6C4DFF]/30 shadow-[0_0_0_1px_rgba(108,77,255,0.15),0_12px_40px_-12px_rgba(108,77,255,0.25)]' : ''
                }`}>
                  {hasOffer && offer.label && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-lg tracking-wide whitespace-nowrap flex items-center gap-1">
                      <Flame size={10} strokeWidth={2.5} /> {offer.label}
                    </div>
                  )}
                  {planBadge && !hasOffer && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#6C4DFF] to-accent-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-glow-brand tracking-wide whitespace-nowrap">
                      {planBadge}
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="font-extrabold text-white text-base">{plan.name}</h3>
                  </div>

                  <div className="mb-3">
                    {hasOffer ? (
                      <div>
                        <span className="text-base text-white/30 line-through">₹{offer.mrp / 100}</span>
                        <span className="text-2xl font-extrabold text-white ml-1.5">₹{offer.salePrice / 100}</span>
                        <p className="text-[10px] text-green-400 font-bold mt-0.5">{offer.discountPercent}% OFF</p>
                      </div>
                    ) : (
                      <span className="text-2xl font-extrabold text-white">₹{plan.amountRupees}</span>
                    )}
                    <p className="text-[10px] text-white/25 font-semibold uppercase tracking-wide mt-0.5">{plan.durationLabel}</p>
                  </div>

                  <ul className="space-y-1.5 mb-4 flex-1">
                    {plan.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-center gap-2 text-[12px] text-white/50">
                        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" strokeWidth={2.5} />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button onClick={() => { if (!user) { navigate('/login'); return; } navigate('/pricing'); }}
                    className={`btn-premium w-full py-3 text-[13px] font-bold rounded-xl ${
                      isPopular ? 'btn-premium-gradient' : 'bg-white/[0.04] border border-white/[0.08] text-white hover:bg-white/[0.08]'
                    }`}>
                    {user ? `Get ${plan.durationLabel}` : 'Sign Up'} <ArrowRight size={12} strokeWidth={2.5} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Trust bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
            {[
              { Icon: Shield, t: 'Secure Payment', d: 'UPI · Cards' },
              { Icon: Zap, t: 'Instant Access', d: 'Turant unlock' },
              { Icon: CreditCard, t: 'Pay Once', d: 'No hidden fees' },
              { Icon: Users, t: 'Learners Love It', d: 'Build confidence' },
            ].map(x => (
              <div key={x.t} className="dark-card-flat !rounded-xl px-3 py-3 text-center">
                <x.Icon size={16} className="text-white/40 mx-auto mb-1" strokeWidth={2} />
                <p className="text-[11px] font-bold text-white leading-tight">{x.t}</p>
                <p className="text-[9px] text-white/25 mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      )}


      {/* ══════════ FINAL CTA ══════════ */}
      {!subscription.active && (
      <section className="mb-8">
        <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #2d1b69 0%, #4338ca 35%, #6366f1 60%, #7C3AED 80%, #a855f7 100%)' }}>
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute -left-12 bottom-0 w-36 h-36 bg-accent-500/20 rounded-full blur-[50px] pointer-events-none" />
          <h3 className="text-xl sm:text-2xl font-extrabold relative text-white">English samajhne se confidence nahi aata.</h3>
          <p className="text-white/75 text-base mt-2 relative">English bolne ki practice se aata hai.</p>
          <p className="text-white/50 text-sm mt-1.5 relative">Roz 10–15 minute. Suno. Bolo. Improve Karo.</p>
          <button onClick={() => navigate('/free-trial')}
            className="btn-premium px-8 py-4 mt-5 text-[15px] bg-white text-[#1a1145] shadow-[0_8px_32px_-8px_rgba(255,255,255,0.2)] hover:bg-gray-50 relative">
            Start Free Trial →
          </button>
        </div>
      </section>
      )}


      {/* ══════════ FOOTER ══════════ */}
      <footer className="text-center pt-6 pb-4">
        <div className="dark-divider mb-4" />
        <div className="flex items-center justify-center gap-4 text-[12px] text-white/25 font-medium">
          <span className="inline-flex items-center gap-1.5">
            <Star size={11} fill="currentColor" strokeWidth={0} className="text-amber-400" />
            4.9 rated
          </span>
          <span className="text-white/10">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Shield size={11} strokeWidth={2} />
            Secure
          </span>
          <span className="text-white/10">|</span>
          <span className="inline-flex items-center gap-1.5">
            <Globe size={11} strokeWidth={2} />
            Made in India
          </span>
        </div>
      </footer>
    </div>
  );
}
