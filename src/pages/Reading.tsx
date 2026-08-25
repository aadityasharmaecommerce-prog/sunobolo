import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Headphones, Flame, ChevronLeft, ChevronRight, Play } from 'lucide-react';

// ══════════ TYPES ══════════

interface ReadingArticle {
  id: string;
  title: string;
  hook: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  readTime: number;
  emoji: string;
  gradient: string;
  isNew?: boolean;
  isTrending?: boolean;
}

// ══════════ CATEGORIES ══════════

const CATEGORIES = [
  { id: 'all', label: 'For You', icon: '✨', bg: 'bg-[#6C4DFF]/15', border: 'border-[#6C4DFF]/30' },
  { id: 'love', label: 'Love', icon: '❤️', bg: 'bg-pink-500/15', border: 'border-pink-500/30' },
  { id: 'crime', label: 'Mystery', icon: '🔍', bg: 'bg-red-500/15', border: 'border-red-500/30' },
  { id: 'motivation', label: 'Motivation', icon: '🔥', bg: 'bg-amber-500/15', border: 'border-amber-500/30' },
  { id: 'funny', label: 'Funny', icon: '😂', bg: 'bg-green-500/15', border: 'border-green-500/30' },
  { id: 'scary', label: 'Thriller', icon: '👻', bg: 'bg-purple-500/15', border: 'border-purple-500/30' },
  { id: 'life', label: 'Real Life', icon: '📖', bg: 'bg-sky-500/15', border: 'border-sky-500/30' },
  { id: 'inspire', label: 'Inspire', icon: '⭐', bg: 'bg-orange-500/15', border: 'border-orange-500/30' },
] as const;

// ══════════ DUMMY DATA ══════════

const DUMMY_ARTICLES: ReadingArticle[] = [
  { id: 'r1', title: 'The Stranger on the Train', hook: 'She whispered something that changed my life.', category: 'all', difficulty: 'beginner', readTime: 2, emoji: '🚂', gradient: 'from-sky-500/20 to-blue-500/5', isNew: true },
  { id: 'r2', title: '₹500 Phone, ₹50 Lakh Dream', hook: 'Ramesh started with ₹500 phone. Today his company is worth ₹50 lakh.', category: 'all', difficulty: 'intermediate', readTime: 3, emoji: '📱', gradient: 'from-amber-500/20 to-yellow-500/5', isTrending: true },
  { id: 'r3', title: 'The Girl Who Never Gave Up', hook: 'Rejected 47 times. 48th interview changed everything.', category: 'all', difficulty: 'beginner', readTime: 2, emoji: '💪', gradient: 'from-pink-500/20 to-rose-500/5' },
  { id: 'r4', title: 'The Midnight Mystery', hook: '2 AM phone call: "Don\'t look back."', category: 'all', difficulty: 'intermediate', readTime: 3, emoji: '🌙', gradient: 'from-purple-500/20 to-violet-500/5', isNew: true },
  { id: 'r5', title: 'The Love Letter', hook: 'She found a 10-year-old letter. Inside was a secret.', category: 'love', difficulty: 'beginner', readTime: 2, emoji: '💌', gradient: 'from-pink-500/20 to-rose-500/5', isTrending: true },
  { id: 'r6', title: 'Two Strangers, One Bench', hook: 'Every morning, same bench. Today they finally spoke.', category: 'love', difficulty: 'beginner', readTime: 2, emoji: '🌅', gradient: 'from-rose-500/20 to-pink-500/5' },
  { id: 'r7', title: 'The Promise', hook: '"I\'ll come back." He left for 5 years.', category: 'love', difficulty: 'intermediate', readTime: 3, emoji: '🤝', gradient: 'from-red-500/20 to-rose-500/5' },
  { id: 'r8', title: 'The Missing Diamond', hook: '₹2 crore diamond stolen. The suspect? The most trusted man.', category: 'crime', difficulty: 'intermediate', readTime: 3, emoji: '💎', gradient: 'from-red-500/20 to-orange-500/5', isTrending: true },
  { id: 'r9', title: 'The Last Message', hook: '"If I don\'t wake up tomorrow..."', category: 'crime', difficulty: 'intermediate', readTime: 3, emoji: '📱', gradient: 'from-orange-500/20 to-red-500/5' },
  { id: 'r10', title: 'Rickshaw to Rolls Royce', hook: 'Auto driver\'s son is now in IIM.', category: 'motivation', difficulty: 'beginner', readTime: 2, emoji: '🚗', gradient: 'from-amber-500/20 to-yellow-500/5', isTrending: true },
  { id: 'r11', title: 'The 3 AM Rule', hook: '90% successful people wake up at 3 AM. True?', category: 'motivation', difficulty: 'beginner', readTime: 2, emoji: '⏰', gradient: 'from-yellow-500/20 to-amber-500/5' },
  { id: 'r12', title: 'She Built an Empire', hook: 'She sold chai. People laughed. Now she has 12 shops.', category: 'motivation', difficulty: 'beginner', readTime: 2, emoji: '☕', gradient: 'from-orange-500/20 to-amber-500/5', isNew: true },
  { id: 'r13', title: 'My Boss Thinks I\'m Working', hook: 'Longest meeting ever. Nobody understood anything.', category: 'funny', difficulty: 'beginner', readTime: 1, emoji: '😅', gradient: 'from-green-500/20 to-emerald-500/5' },
  { id: 'r14', title: 'The Autowala Philosopher', hook: 'Auto uncle taught me life\'s biggest lesson — for ₹50.', category: 'funny', difficulty: 'beginner', readTime: 2, emoji: '🛺', gradient: 'from-emerald-500/20 to-green-500/5', isTrending: true },
  { id: 'r15', title: 'The Room Next Door', hook: 'Someone cries every night. But nobody lives there.', category: 'scary', difficulty: 'intermediate', readTime: 3, emoji: '🚪', gradient: 'from-purple-500/20 to-violet-500/5' },
  { id: 'r16', title: 'My First Salary', hook: '₹8,000. Maa\'s eyes were shining.', category: 'life', difficulty: 'beginner', readTime: 2, emoji: '💰', gradient: 'from-sky-500/20 to-blue-500/5', isNew: true },
  { id: 'r17', title: 'The Bus Stop Friend', hook: 'Same bus stop. Never spoke. One day...', category: 'life', difficulty: 'beginner', readTime: 2, emoji: '🚌', gradient: 'from-blue-500/20 to-sky-500/5' },
  { id: 'r18', title: 'The Teacher Who Changed 1000 Lives', hook: 'She earned ₹5,000. She taught 1000 kids English.', category: 'inspire', difficulty: 'beginner', readTime: 2, emoji: '👩‍🏫', gradient: 'from-orange-500/20 to-amber-500/5', isTrending: true },
];

// ══════════ COMPONENT ══════════

export default function Reading() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const scrollRef = useRef<HTMLDivElement>(null);

  const filtered = DUMMY_ARTICLES.filter(a => {
    if (activeCategory === 'all') return true;
    return a.category === activeCategory;
  });

  const trending = DUMMY_ARTICLES.filter(a => a.isTrending);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const diffColor = (d: string) =>
    d === 'beginner' ? 'bg-emerald-500/15 text-emerald-300' :
    d === 'intermediate' ? 'bg-amber-500/15 text-amber-300' :
    'bg-red-500/15 text-red-300';

  return (
    <>
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white font-medium transition-colors mb-3">
        <ArrowLeft size={16} strokeWidth={2.5} /> Back
      </button>

      {/* ══════════ HEADER ══════════ */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">📖 Daily Reading</h1>
          <p className="text-[12px] text-white/35 mt-0.5">Read short passages • Improve English</p>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-500/15 text-amber-400 px-3 py-1.5 rounded-full text-[11px] font-bold border border-amber-500/20">
          <Flame size={12} /> 3 Days 🔥
        </div>
      </div>

      {/* ══════════ CATEGORY SLIDER (Blinkit-style) ══════════ */}
      <div className="relative mb-5">
        {/* Left arrow */}
        <button onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0c0a20]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hidden sm:flex">
          <ChevronLeft size={14} />
        </button>

        <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide px-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[12px] font-bold whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat.id
                  ? `${cat.bg} text-white border ${cat.border}`
                  : 'bg-white/[0.04] text-white/40 border border-white/[0.06] hover:bg-white/[0.07]'
              }`}
            >
              <span className="text-sm">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right arrow */}
        <button onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-[#0c0a20]/90 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hidden sm:flex">
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ══════════ TRENDING CAROUSEL ══════════ */}
      {activeCategory === 'all' && trending.length > 0 && (
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-orange-400" />
            <h2 className="text-[13px] font-bold text-white/50">Trending</h2>
          </div>
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {trending.map(article => (
              <button
                key={article.id}
                onClick={() => navigate(`/reading/${article.id}`)}
                className={`w-[200px] shrink-0 dark-card p-3.5 group active:scale-[0.98] bg-gradient-to-br ${article.gradient}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{article.emoji}</span>
                  <span className="text-[9px] font-bold text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded-full">HOT</span>
                </div>
                <h3 className="font-extrabold text-white text-[12px] leading-tight group-hover:text-brand-300 transition-colors line-clamp-2">{article.title}</h3>
                <p className="text-[10px] text-white/25 mt-1 line-clamp-1">{article.hook}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${diffColor(article.difficulty)}`}>{article.difficulty}</span>
                  <span className="text-[9px] text-white/20 flex items-center gap-0.5"><Clock size={8} /> {article.readTime}m</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ══════════ SECTION TITLE ══════════ */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[13px] font-bold text-white/50">
          {activeCategory === 'all' ? '📖 All Stories' : `${CATEGORIES.find(c => c.id === activeCategory)?.icon} ${CATEGORIES.find(c => c.id === activeCategory)?.label}`}
        </h2>
        <span className="text-[10px] text-white/25 bg-white/[0.04] px-2 py-1 rounded-full">{filtered.length}</span>
      </div>

      {/* ══════════ ARTICLE GRID (Blinkit-style compact) ══════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {filtered.length === 0 ? (
          <div className="col-span-2 dark-card p-8 text-center">
            <span className="text-3xl mb-2 block">🔍</span>
            <p className="text-white/30 text-sm">No articles found</p>
          </div>
        ) : (
          filtered.map(article => (
            <button
              key={article.id}
              onClick={() => navigate(`/reading/${article.id}`)}
              className={`text-left dark-card p-3.5 group active:scale-[0.98] bg-gradient-to-br ${article.gradient}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
                  {article.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {article.isNew && <span className="text-[8px] font-bold text-blue-300 bg-blue-500/15 px-1 py-0.5 rounded-full">NEW</span>}
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${diffColor(article.difficulty)}`}>{article.difficulty}</span>
                  </div>
                  <h3 className="font-extrabold text-white text-[13px] leading-tight group-hover:text-brand-300 transition-colors">{article.title}</h3>
                  <p className="text-[11px] text-white/25 mt-0.5 line-clamp-1">{article.hook}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] text-white/20 flex items-center gap-0.5"><Clock size={9} /> {article.readTime}m</span>
                    <span className="text-[10px] text-white/15">•</span>
                    <span className="text-[10px] text-white/20 flex items-center gap-0.5"><Headphones size={9} /> Listen</span>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#6C4DFF]/20 flex items-center justify-center text-brand-400 group-hover:bg-[#6C4DFF]/30 transition-colors shrink-0">
                  <Play size={10} fill="currentColor" />
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* ══════════ BOTTOM TIP ══════════ */}
      <div className="mt-5 flex items-center gap-3 dark-card p-3.5 border-amber-500/10">
        <span className="text-xl shrink-0">💡</span>
        <p className="text-[11px] text-white/30 leading-relaxed">Read a story every day — your English improves automatically!</p>
      </div>

      <div className="h-4" />
    </>
  );
}
