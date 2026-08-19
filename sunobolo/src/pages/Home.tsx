import { Link, useNavigate } from 'react-router-dom';
import { allCourses } from '../data/content';
import { USER_GOALS } from '../data/goals';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="space-y-4 -mt-2 pb-4 animate-fade-in w-full max-w-full overflow-x-hidden">
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-500 to-accent-500 text-white shadow-lg animate-slide-up">
        <div className="absolute -right-8 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-10 w-32 h-32 bg-accent-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="relative p-5">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-3 sm:mb-0">
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur px-2 py-0.5 rounded-full text-[10px] font-medium mb-2">
                <span>🇮🇳</span><span>Made for India</span>
              </div>
              <h1 className="text-xl font-extrabold leading-tight tracking-tight">
                English Bolna<br/>
                <span className="bg-gradient-to-r from-white to-brand-100 bg-clip-text text-transparent">Ab Aapke Haath Mein.</span>
              </h1>
            </div>
            {/* HERO CIRCLE PHOTO - inline styles for bulletproof object-fit */}
            <div className="w-20 h-20 sm:w-28 sm:h-28 shrink-0 rounded-full overflow-hidden ring-2 ring-white/30 shadow-lg bg-gradient-to-br from-brand-200 to-accent-200">
              <img
                src="/images/hero.webp"
                alt="Student practicing English with SunoBolo"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center center',
                  display: 'block',
                  backgroundColor: '#eef2ff'
                }}
                loading="eager"
                onError={(e) => {
                  const t = e.target as HTMLImageElement;
                  t.style.background = 'linear-gradient(135deg, #c7d2fe 0%, #fbcfe8 100%)';
                }}
              />
            </div>
          </div>
          <p className="text-white/85 text-[11px] sm:text-xs leading-relaxed mt-1 sm:mt-2 text-center sm:text-left">
            Suno · Bolo · Repeat. Real-life English with the same Indian English voice on every sentence.
          </p>
          <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
            <button onClick={() => navigate('/free-trial')} className="bg-white text-brand-700 font-bold px-4 py-2.5 rounded-xl text-sm shadow-md hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-1.5">
              🎧 Free Trial
            </button>
            <button onClick={() => navigate('/courses')} className="bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold px-3.5 py-2.5 rounded-xl text-sm hover:bg-white/20 active:scale-95 transition-all">
              All Courses →
            </button>
          </div>
        </div>
      </section>

      {/* 3-step method */}
      <section className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {[
          { emoji: '🔊', title: 'Listen 3×', desc: 'Clear audio', color: 'from-blue-500 to-cyan-500' },
          { emoji: '🎤', title: 'Speak 3×', desc: 'Confidence', color: 'from-pink-500 to-rose-500' },
          { emoji: '✅', title: 'Use it', desc: 'Real life', color: 'from-emerald-500 to-green-500' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-2.5 text-center shadow-sm border border-gray-100">
            <div className={`w-9 h-9 mx-auto rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center text-base mb-1.5 shadow-sm`}>{s.emoji}</div>
            <p className="font-bold text-[11px] text-gray-900 leading-tight">{s.title}</p>
            <p className="text-[9px] text-gray-500 mt-0.5 leading-tight">{s.desc}</p>
          </div>
        ))}
      </section>

      <button onClick={() => navigate('/free-trial')} className="w-full bg-gradient-to-br from-accent-500 via-accent-600 to-brand-600 text-white p-4 rounded-2xl shadow-lg shadow-accent-500/30 active:scale-[.98] transition-all text-left flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl shrink-0">🎧</div>
        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-sm leading-tight">25 Sentences Free</p>
          <p className="text-white/80 text-[11px] mt-0.5">No login • Audio • Try now</p>
        </div>
        <span className="text-xl shrink-0">→</span>
      </button>

      <section className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-bold text-sm text-gray-900">My goal is...</h2>
          <Link to="/courses" className="text-[11px] text-brand-600 font-semibold">See all →</Link>
        </div>
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {USER_GOALS.slice(0, 9).map((g) => (
            <button key={g.id} onClick={() => navigate('/courses')} className="bg-gradient-to-b from-gray-50 to-gray-100 hover:from-brand-50 hover:to-accent-50 border border-transparent hover:border-brand-200 rounded-lg p-2 text-center transition-all active:scale-95" title={g.label}>
              <div className="text-base mb-0.5 leading-none">{g.emoji}</div>
              <p className="text-[9px] sm:text-[10px] font-semibold text-gray-700 leading-tight line-clamp-2 min-h-[20px] flex items-center justify-center">{g.label}</p>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-base font-extrabold text-gray-900 mb-2.5">Pick a course</h2>
        <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
          {allCourses.slice(0, 8).map((course) => (
            <Link key={course.id} to={`/course/${course.id}`} className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 hover:shadow-md hover:border-brand-200 active:scale-[.98] transition-all block">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${course.color === 'accent' ? 'bg-accent-100' : 'bg-brand-100'}`}>{course.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[13px] text-gray-900 truncate">{course.title}</h3>
                  <p className="text-[10px] text-gray-500 mt-0.5">{course.totalSentences}·{course.totalLessons}L</p>
                </div>
                <div className="text-right shrink-0">
                  {course.isFree ? (
                    <span className="text-[9px] font-bold text-success-600 bg-success-50 px-1.5 py-0.5 rounded">FREE</span>
                  ) : (
                    <span className="text-xs font-bold text-gray-900">{course.price}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-success-50 via-brand-50 to-accent-50 rounded-2xl p-4 border border-success-100/40">
        <h2 className="font-bold text-sm text-gray-900 mb-2.5 text-center">Humara Wada ✋</h2>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { e: '🔊', t: 'Same voice', d: 'every sentence' },
            { e: '🇮🇳', t: 'Indian accent', d: 'en-IN style' },
            { e: '📚', t: '4075+ sentences', d: 'real English' },
          ].map((x, i) => (
            <div key={i} className="bg-white/85 rounded-xl p-2.5 text-center shadow-sm">
              <div className="text-xl mb-1">{x.e}</div>
              <p className="text-[10px] font-bold text-gray-900 leading-tight">{x.t}</p>
              <p className="text-[9px] text-gray-500 leading-tight mt-0.5">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="text-center text-[10px] text-gray-400 pb-3">
        <p className="font-medium">Made with ❤️ by <span className="text-gray-600 font-bold">Pankaj Upadhyay</span></p>
        <p className="text-gray-300 mt-0.5">Suno · Bolo · Repeat</p>
      </div>
    </div>
  );
}
