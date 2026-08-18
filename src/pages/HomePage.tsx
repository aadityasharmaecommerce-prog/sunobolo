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
    'English samajh aati hai par bolne mein confidence nahi? 25 free sentences se practice start karein.',
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

  return (
    <div>
      {/* ═══════════════════════════════════════════
          1. HERO — Image-style two-column
         ═══════════════════════════════════════════ */}
      <section className="hero-v2">
        <div className="container hero-v2__grid">
          {/* LEFT */}
          <div className="hero-v2__left">
            <span className="hero-v2__badge">🇮🇳 Hindi-Friendly English Speaking Practice</span>
            <h1 className="hero-v2__title">
              English Bolna<br />
              Ab Aapke <span className="hero-v2__accent">Haath Mein.</span>
            </h1>
            <div className="hero-v2__steps">
              <span>🔊 Suno.</span>
              <span>🎤 Samjho.</span>
              <span>🔄 Bolo.</span>
              <span>⭕ Repeat.</span>
            </div>
            <p className="hero-v2__desc">
              Roz 10–15 minute ki practice se English speaking confidence dheere dheere badhta hai.
            </p>
            <div className="hero-v2__cta-card">
              <div className="hero-v2__cta-left">
                <span className="hero-v2__cta-icon">🎁</span>
                <div>
                  <strong>25 SENTENCES FREE</strong>
                  <small>No Login · No Payment · Start Now</small>
                </div>
              </div>
              <span className="hero-v2__cta-arrow">→</span>
            </div>
          </div>

          {/* RIGHT — Hero illustration */}
          <div className="hero-v2__right">
            <img
              src="/hero-illustration.svg"
              alt="SunoBolo English — Suno, Bolo, Repeat. Phone mockup showing practice interface with girl learning."
              className="hero-v2__illustration"
              width={500}
              height={500}
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          2. FEATURES STRIP — Listen/Speak/Repeat/Use
         ═══════════════════════════════════════════ */}
      <section className="features-strip">
        <div className="container">
          <div className="features-strip__grid">
            {[
              { icon: '🎧', title: 'Listen 3x', sub: 'Clear Audio Practice' },
              { icon: '🎤', title: 'Speak 3x', sub: 'Bolkar Seekho Confidence Badhaao' },
              { icon: '🔄', title: 'Repeat & Improve', sub: 'Roz Practice, Roz Improvement' },
              { icon: '🌍', title: 'Use in Real Life', sub: 'Jo seekha, use kijiye real situations mein' },
            ].map((f) => (
              <div key={f.title} className="features-strip__item">
                <span className="features-strip__icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <small>{f.sub}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          3. REAL-LIFE ENGLISH — Category cards
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">→ English Jo Aapki Life Mein Kaam Aaye ←</h2>
          <div className="reallife-grid">
            {[
              { emoji: '📞', title: 'Phone Calls', sub: 'English mein baat karna easy hoga.' },
              { emoji: '🛍️', title: 'Daily Life', sub: 'Shopping, requests, conversations.' },
              { emoji: '💼', title: 'Interview', sub: 'Confident answers, better opportunities.' },
              { emoji: '🏢', title: 'Office', sub: 'Meetings, updates, team communication.' },
              { emoji: '✈️', title: 'Travel', sub: 'Safar mein English bolna simple hoga.' },
              { emoji: '👥', title: 'Social Life', sub: 'Nayi dosti, nayi conversations.' },
            ].map((item) => (
              <div key={item.title} className="reallife-card">
                <span className="reallife-card__emoji">{item.emoji}</span>
                <h4>{item.title}</h4>
                <p>{item.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          4. TESTIMONIAL
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="testimonial-card">
            <div className="testimonial-card__quote">"</div>
            <p>SunoBolo se roz thoda practice karta hu, ab English bolne ka darr kaafi kam ho gaya hai.</p>
            <span className="testimonial-card__author">— Real SunoBolo Learner</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          5. HUMARA WADA — Trust section
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Humara Wada</h2>
          <div className="wada-grid">
            {[
              { icon: '✅', title: '100%', sub: 'Practical Sentences' },
              { icon: '📊', title: 'Step By Step', sub: 'Learning Path' },
              { icon: '❤️', title: 'Beginner to Advanced', sub: 'Complete Journey' },
            ].map((w) => (
              <div key={w.title} className="wada-card">
                <span className="wada-card__icon">{w.icon}</span>
                <strong>{w.title}</strong>
                <small>{w.sub}</small>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          6. HOW IT WORKS
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Method" title="English Speaking Practice Itni Simple Hai" align="center">
            <div className="how-steps">
              <div className="how-step">
                <span className="how-step__num">01</span>
                <div className="how-step__icon">🔊</div>
                <h3>SUNO</h3>
                <p>Sentence ko natural English voice mein 3 baar suniye.</p>
              </div>
              <div className="how-step__arrow" aria-hidden="true">↓</div>
              <div className="how-step">
                <span className="how-step__num">02</span>
                <div className="how-step__icon">🎤</div>
                <h3>BOLO</h3>
                <p>Sentence ko khud 3 baar bolkar practice kijiye.</p>
              </div>
              <div className="how-step__arrow" aria-hidden="true">↓</div>
              <div className="how-step">
                <span className="how-step__num">03</span>
                <div className="how-step__icon">🔁</div>
                <h3>REPEAT</h3>
                <p>Jab tak comfortable feel ho, practice repeat kijiye.</p>
              </div>
            </div>
            <p className="how-note">Grammar ki long lectures ke bajay, real speaking practice par focus.</p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          7. SHOW THE ACTUAL PRODUCT
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Demo" title="Aise Hogi Aapki Daily Practice" align="center">
            <div className="demo-mockup">
              <div className="demo-card">
                <p className="demo-english">"I'm running late."</p>
                <p className="demo-hindi">"मुझे देर हो रही है।"</p>
                <div className="demo-phase">
                  <span className="demo-phase__label">🔊 Listening</span>
                  <div className="demo-dots">
                    <span className="demo-dot demo-dot--done">✓ 1/3</span>
                    <span className="demo-dot demo-dot--done">✓ 2/3</span>
                    <span className="demo-dot demo-dot--active">3/3</span>
                  </div>
                </div>
                <div className="demo-phase">
                  <span className="demo-phase__label">🎤 Speaking</span>
                  <div className="demo-dots">
                    <span className="demo-dot">1/3</span>
                    <span className="demo-dot">2/3</span>
                    <span className="demo-dot">3/3</span>
                  </div>
                </div>
                <div className="demo-done">✅ Sentence Complete</div>
                <div className="demo-next">NEXT →</div>
              </div>
            </div>
            <Button size="lg" to="/free-trial" style={{ marginTop: 'var(--sp-6)' }}>🎧 25 FREE SENTENCES TRY KAREIN</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          8. PROBLEM SECTION
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Problem" title="English Aati Hai… Par Bolte Waqt Problem Hoti Hai?" align="center">
            <div className="problem-cards">
              {[
                { emoji: '📞', text: 'Phone par English bolne mein hesitation' },
                { emoji: '💼', text: 'Interview mein answer bolne mein difficulty' },
                { emoji: '🏢', text: 'Office mein English communication ka pressure' },
                { emoji: '🗣️', text: 'Daily conversation mein words yaad na aana' },
              ].map((item) => (
                <div key={item.emoji} className="problem-card-new">
                  <span className="problem-card-new__emoji">{item.emoji}</span>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <p className="problem-solution">Problem English samajhne ki nahi,<br />practice ki bhi ho sakti hai.</p>
            <Button to="/free-trial">FREE PRACTICE TRY KAREIN →</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          9. WHO IS IT FOR
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="For Everyone" title="Aapke English Goal Ke Liye" align="center">
            <div className="who-grid">
              {[
                { emoji: '👶', title: 'Kids', sub: 'Simple speaking practice' },
                { emoji: '🎒', title: 'Students', sub: 'School & communication' },
                { emoji: '🟢', title: 'Beginners', sub: 'Start from zero' },
                { emoji: '🗣️', title: 'Daily Life', sub: 'Everyday conversations' },
                { emoji: '💼', title: 'Interview', sub: 'Interview practice' },
                { emoji: '🏢', title: 'Corporate', sub: 'Office communication' },
              ].map((item) => (
                <div key={item.title} className="who-card">
                  <span className="who-card__emoji">{item.emoji}</span>
                  <h4>{item.title}</h4>
                  <p>{item.sub}</p>
                </div>
              ))}
            </div>
            <Button variant="outline" to={ROUTES.courses}>EXPLORE ALL COURSES →</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          10. COURSE VALUE / ROADMAP
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="Roadmap" title="Ek Course Nahi — Complete English Speaking Journey" align="center">
            <div className="roadmap">
              <div className="roadmap__main">
                <div className="roadmap-node roadmap-node--green">🟢 Beginner</div>
                <div className="roadmap-arrow">↓</div>
                <div className="roadmap-node roadmap-node--yellow">🟡 Intermediate</div>
                <div className="roadmap-arrow">↓</div>
                <div className="roadmap-node roadmap-node--blue">🔵 Advanced</div>
              </div>
              <div className="roadmap__special">
                <span>Daily Life</span>
                <span>Interview</span>
                <span>Corporate</span>
                <span>Business</span>
                <span>Travel</span>
                <span>Kids</span>
              </div>
            </div>
            <p className="roadmap__note">Apne level aur goal ke hisaab se practice choose karein.</p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          11. COURSE CONTENT PREVIEW
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="What You'll Learn" title="Course Content Dekhiye" align="center">
            <div className="preview-grid">
              <div className="preview-card">
                <h3>🌱 Beginner English</h3>
                <ul>
                  <li>✓ Greetings</li>
                  <li>✓ Introduction</li>
                  <li>✓ Family</li>
                  <li>✓ Daily Routine</li>
                  <li>✓ Shopping</li>
                  <li>✓ Phone Calls</li>
                  <li>✓ Asking Questions</li>
                  <li>✓ Requests</li>
                  <li>✓ Travel</li>
                  <li>✓ Daily Conversations</li>
                </ul>
              </div>
              <div className="preview-card">
                <h3>💼 Interview English</h3>
                <ul>
                  <li>✓ Self Introduction</li>
                  <li>✓ Education</li>
                  <li>✓ Experience</li>
                  <li>✓ Strengths</li>
                  <li>✓ Weaknesses</li>
                  <li>✓ Common Questions</li>
                  <li>✓ Salary Discussion</li>
                  <li>✓ Career Goals</li>
                </ul>
              </div>
              <div className="preview-card">
                <h3>🏢 Corporate English</h3>
                <ul>
                  <li>✓ Meetings</li>
                  <li>✓ Client Calls</li>
                  <li>✓ Office Conversations</li>
                  <li>✓ Giving Updates</li>
                  <li>✓ Presentations</li>
                  <li>✓ Follow-ups</li>
                </ul>
              </div>
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          12. FREE TRIAL SECTION
         ═══════════════════════════════════════════ */}
      <section className="section section--trial">
        <div className="container">
          <Section eyebrow="Free Trial" title="🆓 Pehle Khud Try Karo" align="center">
            <h3 className="trial-subtitle">25 Real-Life English Sentences FREE</h3>
            <p className="trial-desc">Login ki zaroorat nahi. Payment ki zaroorat nahi. Bas practice start kijiye.</p>
            <div className="trial-method">
              <span>🔊 Listen 3×</span>
              <span>🎤 Speak 3×</span>
              <span>➡️ Next</span>
            </div>
            <Button size="lg" to="/free-trial">START 25 FREE SENTENCES →</Button>
            <p className="trial-note">No credit card required.</p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          13. WHY CONTINUE AFTER TRIAL
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section align="center">
            <h2>25 Sentences Sirf Shuruaat Hai.</h2>
            <p style={{ maxWidth: 540, margin: '0 auto var(--sp-5)', lineHeight: 1.7, color: 'var(--text-3)' }}>
              Free practice se method experience kijiye. Complete courses ke saath apni English speaking practice ko Beginner se Advanced level tak continue kijiye.
            </p>
            <div className="continue-flow">
              <span>Beginner</span>
              <span className="continue-arrow">→</span>
              <span>Intermediate</span>
              <span className="continue-arrow">→</span>
              <span>Advanced</span>
            </div>
            <div className="continue-special">
              <span>Daily Life</span><span>Interview</span><span>Corporate</span><span>Business</span><span>Travel</span>
            </div>
            <Button to={ROUTES.courses}>CONTINUE LEARNING →</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          14. EMOTIONAL / ASPIRATIONAL
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section align="center">
            <h2>Aaj Ka Ek Sentence.<br />Kal Ki Ek Confident Conversation.</h2>
            <p style={{ maxWidth: 540, margin: '0 auto var(--sp-6)', lineHeight: 1.7, color: 'var(--text-3)' }}>
              English speaking confidence ek din mein nahi banta. Regular practice se dheere-dheere improve hota hai.
            </p>
            <div className="aspiration-scenarios">
              {['🎤 Interview', '📞 Phone Call', '🏢 Office', '✈️ Travel'].map((s) => (
                <span key={s} className="aspiration-scenario">{s}</span>
              ))}
            </div>
            <p style={{ margin: 'var(--sp-5) 0', fontWeight: 600 }}>
              "Perfect English bolne ka wait mat kijiye.<br />Practice shuru kijiye."
            </p>
            <Button to="/free-trial">START FREE →</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          15. FOR PARENTS (KIDS)
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Kids" title="Bachchon Ke Liye Bhi English Speaking Practice" align="center">
            <p style={{ maxWidth: 500, margin: '0 auto var(--sp-5)', lineHeight: 1.7, color: 'var(--text-3)' }}>
              Simple sentences, audio practice aur repeat-based learning ke saath bachchon ko English bolne ki practice karne dein.
            </p>
            <div className="kids-flow">
              <span>👧 Listen</span>
              <span>🎤 Speak</span>
              <span>⭐ Practice</span>
              <span>😊 Confidence</span>
            </div>
            <Button to="/english-for-kids">KIDS ENGLISH →</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          16. PURCHASE SECTION
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section align="center">
            <h2>Ready To Continue Your English Practice?</h2>
            <p style={{ maxWidth: 500, margin: '0 auto var(--sp-5)', lineHeight: 1.7, color: 'var(--text-3)' }}>
              Free trial mein method try kijiye. Agar useful lage, apni complete learning journey continue kijiye.
            </p>
            <div className="benefits-grid">
              {[
                '✓ Beginner to Advanced',
                '✓ Daily Life English',
                '✓ Interview English',
                '✓ Corporate English',
                '✓ Speaking Practice',
                '✓ Audio Practice',
                '✓ Hindi Meaning',
                '✓ Listen 3× + Speak 3×',
              ].map((b) => (
                <span key={b} className="benefit-item">{b}</span>
              ))}
            </div>
            <Button size="lg" to={ROUTES.pricing}>🚀 START LEARNING</Button>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          17. VALUE COMPARISON
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Why SunoBolo" title="SunoBolo Mein Aap Kya Karte Hain?" align="center">
            <div className="compare-grid">
              <div className="compare-card compare-card--old">
                <h4>Traditional Reading</h4>
                <p>📖 Read</p>
                <p>📝 Memorize</p>
                <p>📚 Study</p>
              </div>
              <div className="compare-card compare-card--new">
                <h4>SunoBolo Practice</h4>
                <p>🔊 Listen</p>
                <p>🎤 Speak</p>
                <p>🔁 Repeat</p>
                <p>🗣️ Practice</p>
              </div>
            </div>
            <p style={{ marginTop: 'var(--sp-4)', color: 'var(--text-3)' }}>SunoBolo ka focus speaking practice par hai.</p>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          18. FAQ
         ═══════════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <Section eyebrow="FAQ" title="Aksar Pooche Jane Wale Sawaal" align="center">
            <div className="faq-list">
              {[
                { q: 'Kya free trial ke liye login chahiye?', a: 'Nahi. Bina login ke 25 sentences practice kar sakte hain.' },
                { q: 'Free trial mein kitne sentences hain?', a: '25 real-life English sentences.' },
                { q: 'Sentence kaise practice karna hai?', a: 'Listen 3× → Speak 3× → Next sentence.' },
                { q: 'Kya Hindi meaning milega?', a: 'Haan, har sentence ke saath Hindi meaning hai.' },
                { q: 'Kids ke liye course hai?', a: 'Haan, Kids English course available hai.' },
                { q: 'Interview English available hai?', a: 'Haan, Interview English course available hai.' },
                { q: 'Kya mobile par use kar sakte hain?', a: 'Haan, poora website mobile-friendly hai.' },
                { q: 'Purchase ke baad kya milega?', a: 'Beginner se Advanced tak sab courses, audio practice, Hindi meaning ke saath.' },
              ].map((item) => (
                <details key={item.q} className="faq-item">
                  <summary className="faq-question">{item.q}</summary>
                  <p className="faq-answer">{item.a}</p>
                </details>
              ))}
            </div>
          </Section>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          19. FINAL CTA
         ═══════════════════════════════════════════ */}
      <section className="section section--final-cta">
        <div className="container">
          <div className="final-cta">
            <h2>English Bolna Ek Din Mein Nahi Aata.<br />Lekin Practice Aaj Se Shuru Ho Sakti Hai.</h2>
            <p style={{ margin: 'var(--sp-4) 0', color: 'rgba(255,255,255,0.85)' }}>Apna pehla sentence aaj hi practice kijiye.</p>
            <Button size="lg" to="/free-trial" variant="secondary">🆓 START 25 FREE SENTENCES</Button>
            <p style={{ marginTop: 'var(--sp-3)', fontSize: 'var(--fs-sm)', color: 'rgba(255,255,255,0.7)' }}>No Login · No Payment</p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          20. COURSES (existing)
         ═══════════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <Section eyebrow="Courses" title="Apne Goal Ke Hisaab Se Seekho" align="left">
            {loading ? (
              <LoadingState label="Courses load ho rahe hain…" />
            ) : (
              <div className="home-courses">
                {courses.map((c) => (
                  <CourseCard key={c.id} course={c} progress={getCourseProgress(c.id)} />
                ))}
              </div>
            )}
          </Section>
        </div>
      </section>
    </div>
  );
}
