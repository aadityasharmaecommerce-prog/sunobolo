import { useEffect, useState } from 'react';
import type { Course } from '@/types';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useProgress } from '@/context/ProgressContext';
import { coursesService } from '@/services/coursesService';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { CourseCard } from '@/components/course/CourseCard';
import { LoadingState } from '@/components/ui/States';

export function HomePage() {
  usePageMeta(
    'SunoBolo English — Suno. Bolo. Repeat Karo. English Seekho.',
    'Roz sirf 10–15 minute practice karke English speaking improve karein. 25 free sentences — no login required.',
    '/',
  );

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCourseProgress } = useProgress();

  useEffect(() => {
    let cancelled = false;
    coursesService.getCourses().then((c) => {
      if (!cancelled) { setCourses(c); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const kidsCourses = courses.filter((c) => c.audience === 'kids');
  const studentCourses = courses.filter((c) => c.audience === 'students');
  const adultCourses = courses.filter((c) => c.audience === 'adults' && ['beginner', 'intermediate', 'advanced'].includes(c.level));
  const proCourses = courses.filter((c) => c.audience === 'professionals');

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="hero">
        <div className="container">
          <p className="eyebrow">🇮🇳 MADE FOR INDIA · HINGLISH FRIENDLY</p>
          <h1>English Bolna Seekho</h1>
          <p className="hero__sub">Suno. Bolo. Repeat Karo.</p>
          <p className="hero__supporting">Roz sirf 10–15 minute English speaking practice karein.</p>
          <div className="hero__cta">
            <Button size="lg" to="/free-trial">🟢 25 SENTENCES FREE</Button>
          </div>
          <p className="hero__no-login">No Login · No Payment</p>
          <div className="hero__visual-flow">
            <div className="hero-flow-step">
              <span className="hero-flow-emoji" aria-hidden="true">🔊</span>
              <span className="hero-flow-label">SUNO</span>
            </div>
            <span className="hero-flow-arrow" aria-hidden="true">↓</span>
            <div className="hero-flow-step">
              <span className="hero-flow-emoji" aria-hidden="true">🎤</span>
              <span className="hero-flow-label">BOLO</span>
            </div>
            <span className="hero-flow-arrow" aria-hidden="true">↓</span>
            <div className="hero-flow-step">
              <span className="hero-flow-emoji" aria-hidden="true">🔁</span>
              <span className="hero-flow-label">REPEAT</span>
            </div>
          </div>
          <div className="hero__secondary">
            <Button variant="ghost" to="#how-it-works">Kaise Kaam Karta Hai?</Button>
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section id="how-it-works" className="section">
        <div className="container">
          <Section eyebrow="How it works" title="Sirf 3 steps — bas suno, bolo, dohrao" align="center">
            <div className="steps">
              <div className="step">
                <span className="step__num">01</span>
                <div className="step__emoji" aria-hidden="true">🔊</div>
                <h3>Suno</h3>
                <p>Sentence ko 3 baar suno.</p>
              </div>
              <div className="step">
                <span className="step__num">02</span>
                <div className="step__emoji" aria-hidden="true">🎤</div>
                <h3>Bolo</h3>
                <p>Sentence ko 3 baar bolo.</p>
              </div>
              <div className="step">
                <span className="step__num">03</span>
                <div className="step__emoji" aria-hidden="true">➡️</div>
                <h3>Repeat & Improve</h3>
                <p>Next sentence par jao.</p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ FREE TRIAL PROMPT ═══ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Free Trial" title="🆓 कोई Login नहीं — 25 Sentences अभी Practice करें" align="center">
            <p className="section__subtitle">English sentence suniye, 3 baar repeat kijiye aur khud bhi 3 baar bolkar practice kijiye.</p>
            <div className="hero__cta" style={{ marginTop: 'var(--sp-6)' }}>
              <Button size="lg" to="/free-trial">START FREE PRACTICE →</Button>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ PROBLEM SECTION ═══ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Problem" title="Kya Aapke Saath Bhi Aisa Hota Hai?" align="center">
            <div className="problem-grid">
              <div className="problem-card">
                <p>"English samajh aati hai, par bolte waqt words nahi milte."</p>
              </div>
              <div className="problem-card">
                <p>"Phone par English mein baat karne mein hesitation hoti hai."</p>
              </div>
              <div className="problem-card">
                <p>"Interview mein answer pata hota hai, par English mein bolne mein confidence kam hota hai."</p>
              </div>
              <div className="problem-card">
                <p>"Office mein English bolne ki practice chahiye."</p>
              </div>
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
              <h3>Aap akela nahi hain.</h3>
              <p style={{ color: 'var(--c-muted, #94a3b8)', marginBottom: 'var(--sp-4)' }}>Practice se dheere-dheere confidence improve ho sakta hai.</p>
              <Button to="/free-trial">25 FREE SENTENCES TRY KAREIN →</Button>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ WHY IT WORKS ═══ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Method" title="English Bolna Practice Se Aata Hai" align="center">
            <p style={{ maxWidth: 540, margin: '0 auto var(--sp-6)', lineHeight: 1.7 }}>
              Sirf English padhna enough nahi hota. English bolne ke liye English ko sunna aur khud bolna bhi zaroori hai.
            </p>
            <div className="steps">
              <div className="step">
                <div className="step__emoji" aria-hidden="true">🔊</div>
                <h3>Listen</h3>
              </div>
              <div className="step">
                <div className="step__emoji" aria-hidden="true">🎤</div>
                <h3>Speak</h3>
              </div>
              <div className="step">
                <div className="step__emoji" aria-hidden="true">🔁</div>
                <h3>Repeat</h3>
              </div>
              <div className="step">
                <div className="step__emoji" aria-hidden="true">🗣️</div>
                <h3>Better Speaking</h3>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ ASPIRATION ═══ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Journey" title="Aaj Ka Ek Sentence. Kal Ka Confident Conversation." align="center">
            <div className="aspiration-flow">
              <div className="aspiration-card aspiration-card--today">
                <span className="aspiration-label">Aaj</span>
                <p>"I know what I want to say, but I hesitate."</p>
              </div>
              <div className="aspiration-arrow" aria-hidden="true">↓</div>
              <div className="aspiration-card aspiration-card--practice">
                <span className="aspiration-label">Daily Practice</span>
                <p>🔊 Suno → 🎤 Bolo → 🔁 Repeat</p>
              </div>
              <div className="aspiration-arrow" aria-hidden="true">↓</div>
              <div className="aspiration-card aspiration-card--future">
                <span className="aspiration-label">With Practice</span>
                <p>"I can express myself more confidently."</p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ WHO IS IT FOR ═══ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="For Everyone" title="Aapke Liye, Aapke Level Par" align="center">
            <div className="audience-grid">
              {[
                { emoji: '👶', title: 'Kids', sub: 'Simple English speaking practice.' },
                { emoji: '🎒', title: 'Students', sub: 'School & everyday English.' },
                { emoji: '🌱', title: 'Beginners', sub: 'Start from zero.' },
                { emoji: '🗣️', title: 'Daily English', sub: 'Real-life conversations.' },
                { emoji: '💼', title: 'Interview', sub: 'Interview speaking practice.' },
                { emoji: '🏢', title: 'Corporate', sub: 'Office & professional English.' },
              ].map((item) => (
                <div key={item.title} className="audience-card">
                  <span className="audience-card__emoji" aria-hidden="true">{item.emoji}</span>
                  <h4>{item.title}</h4>
                  <p>{item.sub}</p>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 'var(--sp-6)' }}>
              <Button variant="outline" to={ROUTES.courses}>View All Courses →</Button>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ COURSES ═══ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Courses" title="Apne Goal Ke Hisaab Se Seekho" align="left">
            {loading ? (
              <LoadingState label="Courses load ho rahe hain…" />
            ) : (
              <>
                {kidsCourses.length > 0 && (
                  <>
                    <h3 style={{ marginBottom: 'var(--sp-4)' }}>👶 Kids English</h3>
                    <div className="home-courses" style={{ marginBottom: 'var(--sp-8)' }}>
                      {kidsCourses.map((c) => (
                        <CourseCard key={c.id} course={c} progress={getCourseProgress(c.id)} />
                      ))}
                    </div>
                  </>
                )}
                {studentCourses.length > 0 && (
                  <>
                    <h3 style={{ marginBottom: 'var(--sp-4)' }}>🎒 School English</h3>
                    <div className="home-courses" style={{ marginBottom: 'var(--sp-8)' }}>
                      {studentCourses.map((c) => (
                        <CourseCard key={c.id} course={c} progress={getCourseProgress(c.id)} />
                      ))}
                    </div>
                  </>
                )}
                {adultCourses.length > 0 && (
                  <>
                    <h3 style={{ marginBottom: 'var(--sp-4)' }}>🌱 Beginner → Advanced</h3>
                    <div className="home-courses" style={{ marginBottom: 'var(--sp-8)' }}>
                      {adultCourses.map((c) => (
                        <CourseCard key={c.id} course={c} progress={getCourseProgress(c.id)} />
                      ))}
                    </div>
                  </>
                )}
                {proCourses.length > 0 && (
                  <>
                    <h3 style={{ marginBottom: 'var(--sp-4)' }}>💼 Professional</h3>
                    <div className="home-courses">
                      {proCourses.map((c) => (
                        <CourseCard key={c.id} course={c} progress={getCourseProgress(c.id)} />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </Section>
        </div>
      </section>

      {/* ═══ REAL-LIFE USE CASES ═══ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Real Life" title="English Aapki Daily Life Mein Kahan Kaam Aayegi?" align="center">
            <div className="usecase-grid">
              {[
                { emoji: '📞', title: 'Phone Call', example: '"Could you please call me later?"' },
                { emoji: '💼', title: 'Interview', example: '"I have strong communication skills."' },
                { emoji: '🏢', title: 'Office', example: '"Let me share my screen."' },
                { emoji: '🛍️', title: 'Shopping', example: '"Can I try this in a different size?"' },
                { emoji: '✈️', title: 'Travel', example: '"Where is the nearest hotel?"' },
                { emoji: '👥', title: 'Conversation', example: '"How was your weekend?"' },
              ].map((item) => (
                <div key={item.title} className="usecase-card">
                  <span className="usecase-card__emoji" aria-hidden="true">{item.emoji}</span>
                  <h4>{item.title}</h4>
                  <p>{item.example}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ TRUST ═══ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Trust" title="Kyun SunoBolo?" align="center">
            <div className="trust-grid">
              <div className="trust-item">
                <span className="trust-item__emoji" aria-hidden="true">📝</span>
                <h4>Simple Practice</h4>
                <p>No complicated lessons.</p>
              </div>
              <div className="trust-item">
                <span className="trust-item__emoji" aria-hidden="true">🆓</span>
                <h4>Start Free</h4>
                <p>25 sentences without login.</p>
              </div>
              <div className="trust-item">
                <span className="trust-item__emoji" aria-hidden="true">📱</span>
                <h4>Practice Anywhere</h4>
                <p>Mobile-friendly.</p>
              </div>
              <div className="trust-item">
                <span className="trust-item__emoji" aria-hidden="true">⏰</span>
                <h4>Your Pace</h4>
                <p>Practice whenever convenient.</p>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ PRICING ═══ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Pricing" title="Apni English Speaking Practice Ko Next Level Par Le Jaiye" align="center">
            <p style={{ maxWidth: 500, margin: '0 auto var(--sp-6)', lineHeight: 1.7, color: 'var(--c-muted, #94a3b8)' }}>
              Aaj ka practice kal ke communication confidence ki foundation ban sakta hai.
            </p>
            <div className="cta-banner" style={{ background: 'var(--gradient-brand)' }}>
              <Button size="lg" to={ROUTES.pricing}>START LEARNING →</Button>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="section">
        <div className="container">
          <div className="cta-banner">
            <h2>Aaj hi 10 minute ki practice karo</h2>
            <p>Pehla lesson free hai — koi card nahi, koi registration nahi.</p>
            <Button size="lg" to="/free-trial">🟢 START FREE PRACTICE →</Button>
            <p className="hero__no-login" style={{ marginTop: 'var(--sp-3)' }}>No Login · No Payment</p>
          </div>
        </div>
      </section>
    </div>
  );
}
