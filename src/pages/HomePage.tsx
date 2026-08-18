import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Audience, Course } from '@/types';
import { AUDIENCE_DETAILS, AUDIENCE_LABELS, GOALS, LEVEL_LABELS, ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { coursesService } from '@/services/coursesService';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingState, ErrorState } from '@/components/ui/States';
import { useProgress } from '@/context/ProgressContext';

const AUDIENCES: Audience[] = ['kids', 'students', 'adults', 'professionals'];

const AUDIENCE_COURSES: Record<Audience, string[]> = {
  kids: ['kids'],
  students: ['school'],
  adults: ['beginner', 'intermediate', 'advanced', 'daily'],
  professionals: ['interview', 'corporate', 'business', 'travel'],
};

const WHY_ITEMS = [
  { emoji: '🔊', title: 'Suno — 3 baar', desc: 'Har sentence ko browser 3 baar bolta hai. Kaan English ke aadi ho jate hain.' },
  { emoji: '🎤', title: 'Bolo — 3 baar', desc: 'Aap 3 baar bolte hain. Bolna hi asli practice hai.' },
  { emoji: '➡️', title: 'Next sentence', desc: 'Roz 10–15 minute, sentence by sentence aage badho.' },
  { emoji: '🇮🇳', title: 'Hindi mein samjho', desc: 'Har sentence ka Hindi meaning saath mein diya hai.' },
  { emoji: '📱', title: 'Mobile first', desc: 'Phone, tablet ya laptop — kahin bhi practice karo.' },
  { emoji: '🆓', title: 'Free shuruaat', desc: 'Kids, School aur Beginner courses bilkul free.' },
];

const TESTIMONIALS = [
  { name: 'Priya, Delhi', text: 'Mujhe bolne mein darr lagta tha. 2 hafte practice ki, ab office mein confidently English bolti hoon.' },
  { name: 'Ramesh, Jaipur', text: 'Suno bolo repeat wala tareeka simple hai. Roz 10 minute karta hoon, sentences yaad reh jate hain.' },
  { name: 'Anita, Pune', text: 'Interview se pehle ye course kiya. Tell me about yourself ab bina ruke bol leti hoon.' },
];

const FAQS = [
  { q: 'Kya SunoBolo English free hai?', a: 'Haan! Kids, School aur Beginner courses bilkul free hain. Advanced aur professional courses ke liye paid packages hain.' },
  { q: 'Mujhe roz kitna time dena hoga?', a: 'Sirf 10–15 minute roz kaafi hai. Har sentence ko 3 baar sunkar, 3 baar bolkar practice karein.' },
  { q: 'Kya mere pronunciation check hoga?', a: 'Abhi app aapko sunkar repeat karne ki practice deti hai. Pronunciation scoring future version mein aayega.' },
  { q: 'Kya ye app bachon ke liye sahi hai?', a: 'Bilkul! Kids section mein alphabet, animals, colors jaise simple topics hain jo khel-khel mein sikhate hain.' },
  { q: 'Kya main phone aur laptop dono par use kar sakta hoon?', a: 'Haan, app fully responsive hai — mobile, tablet aur desktop sab par chalega.' },
];

const FAQ_ITEM = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button type="button" className="faq-item__q" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {q}
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && <p className="faq-item__a">{a}</p>}
    </div>
  );
};

export function HomePage() {
  usePageMeta(
    'SunoBolo English — Suno. Bolo. Repeat Karo. English Seekho.',
    'Roz sirf 10–15 minute practice karke English speaking improve karein. Free English speaking practice for kids, students, adults & professionals.',
    '/',
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { getCourseProgress } = useProgress();

  useEffect(() => {
    let cancelled = false;
    coursesService
      .getCourses()
      .then((data) => {
        if (!cancelled) setCourses(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="home">
      {/* 1 — Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero__badge">🇮🇳 Made for India · Hinglish friendly</span>
          <h1>
            English <span className="accent">Bolna Seekho</span>
          </h1>
          <p className="hero__tagline">Suno. Bolo. Repeat Karo.</p>
          <p className="hero__sub">English Samajhna Nahi, English Bolna Seekho. Roz sirf 10–15 minute practice karke English speaking improve karein.</p>
          <div className="hero__cta">
            <Button to={ROUTES.onboarding} size="lg">
              🚀 START FREE
            </Button>
            <Button to="/#how-it-works" variant="outline" size="lg">
              HOW IT WORKS
            </Button>
          </div>
          <div className="hero__method">
            <span className="method-chip">🔊 Suno <span className="arrow">→</span> 3 baar</span>
            <span className="method-chip">🎤 Bolo <span className="arrow">→</span> 3 baar</span>
            <span className="method-chip">➡️ Next sentence</span>
          </div>
        </div>
      </section>

      <div className="trust-strip">
        <span>✅ No boring grammar</span>
        <span>✅ 390+ practice sentences</span>
        <span>✅ Hindi meanings included</span>
        <span>✅ Works in the browser</span>
      </div>

      {/* 2 — How It Works */}
      <div className="container">
        <Section id="how-it-works" eyebrow="How it works" title="Sirf 3 steps — bas suno, bolo, dohrao">
          <div className="steps">
            <div className="step">
              <span className="step__num">01</span>
              <div className="step__emoji" aria-hidden="true">🔊</div>
              <h3>Suno</h3>
              <p>Sentence ko 3 baar suno. Browser clear English mein bolta hai.</p>
            </div>
            <div className="step">
              <span className="step__num">02</span>
              <div className="step__emoji" aria-hidden="true">🎤</div>
              <h3>Bolo</h3>
              <p>Sentence ko 3 baar bolo. Practice counter aapko track karta hai.</p>
            </div>
            <div className="step">
              <span className="step__num">03</span>
              <div className="step__emoji" aria-hidden="true">➡️</div>
              <h3>Repeat & Improve</h3>
              <p>Next sentence par jao. Roz 10–15 minute, sentence by sentence.</p>
            </div>
          </div>
        </Section>
      </div>

      {/* 3 — Choose Your Goal */}
      <section className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <Section eyebrow="Choose your goal" title="Aap kis liye English seekhna chahte hain?" subtitle="Goal chuno, SunoBolo aapka raasta dikhayega.">
            <div className="goal-grid">
              {GOALS.map((g) => (
                <Link key={g.id} to={ROUTES.onboarding} className="goal-chip">
                  <span className="goal-chip__emoji" aria-hidden="true">{g.emoji}</span>
                  {g.label}
                </Link>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* 4–10 — Audience + course sections */}
      {loading ? (
        <LoadingState label="Courses load ho rahe hain…" />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <>
          {AUDIENCES.map((aud) => {
            const courseIds = AUDIENCE_COURSES[aud];
            const list = courses.filter((c) => courseIds.includes(c.id));
            const detail = AUDIENCE_DETAILS[aud];
            return (
              <section key={aud} className="section" style={aud === 'adults' ? { background: 'var(--surface)' } : undefined}>
                <div className="container">
                  <Section
                    eyebrow={`${AUDIENCE_LABELS[aud]} section`}
                    title={`${detail.emoji} ${detail.heading}`}
                    subtitle={detail.sub}
                    align="left"
                  >
                    <div className="home-courses">
                      {list.map((course) => (
                        <CourseCard key={course.id} course={course} progress={getCourseProgress(course.id)} />
                      ))}
                    </div>
                  </Section>
                </div>
              </section>
            );
          })}

          {/* 10 — Specialized learning (Daily/Interview/Corporate/Business/Travel) */}
          <section className="section" style={{ background: 'var(--surface)' }}>
            <div className="container">
              <Section eyebrow="Specialized learning" title="Apne goal ke hisaab se seekho" subtitle="Daily life, interview, corporate, business aur travel — sab ke liye dedicated courses." align="left">
                <div className="home-courses">
                  {courses
                    .filter((c) => ['daily', 'interview', 'corporate', 'business', 'travel'].includes(c.level))
                    .map((course) => (
                      <CourseCard key={course.id} course={course} progress={getCourseProgress(course.id)} />
                    ))}
                </div>
              </Section>
            </div>
          </section>
        </>
      )}

      {/* 11 — Why SunoBolo */}
      <div className="container">
        <Section eyebrow="Why SunoBolo" title="Yeh alag kyun hai?">
          <div className="why-grid">
            {WHY_ITEMS.map((item) => (
              <div key={item.title} className="why-item">
                <span className="why-item__emoji" aria-hidden="true">{item.emoji}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* 12 — Testimonials (placeholder content) */}
      <section className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <Section eyebrow="Testimonials" title="Log kya keh rahe hain" subtitle="Practice results — placeholder testimonials (real reviews Phase 2 mein add honge).">
            <div className="testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.name} className="testimonial">
                  <div className="testimonial__stars" aria-hidden="true">★★★★★</div>
                  <p>“{t.text}”</p>
                  <div className="testimonial__author">— {t.name}</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* 13 — Pricing placeholder */}
      <div className="container">
        <Section eyebrow="Pricing" title="Ek chhota investment, lifetime confidence" subtitle="FREE se shuru karo, kabhi bhi upgrade karo.">
          <div className="cta-banner" style={{ background: 'var(--gradient-brand)' }}>
            <h2>₹0 se shuru — Free plan mein hi 3 courses hain</h2>
            <p>Complete English ₹499 · Professional ₹599 · Complete Pack ₹799 — sab kuch ek saath.</p>
            <Button to={ROUTES.pricing} variant="outline" size="lg">
              View All Packages →
            </Button>
          </div>
        </Section>
      </div>

      {/* 14 — FAQ */}
      <section className="section" style={{ background: 'var(--surface)', borderBlock: '1px solid var(--border)' }}>
        <div className="container">
          <Section eyebrow="FAQ" title="Aksar pooche jane wale sawal">
            <div className="faq-list">
              {FAQS.map((f) => (
                <FAQ_ITEM key={f.q} q={f.q} a={f.a} />
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* 15 — Final CTA */}
      <div className="container">
        <Section>
          <div className="cta-banner">
            <h2>English bolna seekhna hai? Abhi shuru karo.</h2>
            <p>10 minute ki pehli practice aaj hi karo — {LEVEL_LABELS.beginner} se shuru, ya apna goal chuno.</p>
            <Button to={ROUTES.onboarding} size="lg" variant="secondary">
              START FREE →
            </Button>
          </div>
        </Section>
      </div>
    </div>
  );
}
