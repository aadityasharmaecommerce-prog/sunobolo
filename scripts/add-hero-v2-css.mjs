import fs from 'fs';
import path from 'path';

const file = path.join('src/styles/pages.css');
let css = fs.readFileSync(file, 'utf8');

// ─── HERO V2 CSS ───
const heroV2CSS = `
/* ═══════════════════════════════════════════
   HERO V2 — Image-style two-column
   ═══════════════════════════════════════════ */
.hero-v2 {
  background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 40%, #ede9fe 100%);
  padding: var(--sp-8) 0 var(--sp-6);
  overflow: hidden;
}
.hero-v2__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--sp-8);
  align-items: center;
  min-height: 480px;
}
.hero-v2__left { z-index: 2; }
.hero-v2__badge {
  display: inline-block;
  background: rgba(14, 165, 233, 0.1);
  color: var(--c-sky-dark);
  font-weight: 700;
  font-size: var(--fs-xs);
  padding: 6px 14px;
  border-radius: var(--r-full);
  margin-bottom: var(--sp-4);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.hero-v2__title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: var(--sp-4);
  color: var(--text);
}
.hero-v2__accent {
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.hero-v2__steps {
  display: flex;
  gap: var(--sp-4);
  margin-bottom: var(--sp-4);
  flex-wrap: wrap;
}
.hero-v2__steps span {
  font-weight: 700;
  font-size: var(--fs-md);
  color: var(--text);
}
.hero-v2__desc {
  color: var(--text-3);
  line-height: 1.7;
  margin-bottom: var(--sp-6);
  max-width: 420px;
}
.hero-v2__cta-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--gradient-brand);
  border-radius: var(--r-xl);
  padding: 1.25rem 1.5rem;
  max-width: 380px;
  color: #fff;
  cursor: pointer;
  transition: transform var(--transition), box-shadow var(--transition);
  text-decoration: none;
  box-shadow: 0 12px 32px rgba(14, 165, 233, 0.35);
}
.hero-v2__cta-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 40px rgba(14, 165, 233, 0.45);
}
.hero-v2__cta-left {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
}
.hero-v2__cta-icon { font-size: 1.75rem; }
.hero-v2__cta-left strong { display: block; font-size: var(--fs-lg); }
.hero-v2__cta-left small { opacity: 0.85; font-size: var(--fs-xs); }
.hero-v2__cta-arrow {
  font-size: 1.5rem;
  font-weight: 700;
}

/* ─── Right visual ─── */
.hero-v2__right {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 420px;
}
.hero-v2__visual {
  position: relative;
  width: 100%;
  max-width: 400px;
}

/* Phone mockup */
.hero-v2__phone {
  background: #1e293b;
  border-radius: 28px;
  padding: 10px;
  box-shadow: 0 24px 64px rgba(0,0,0,0.18);
  position: relative;
  z-index: 2;
  max-width: 240px;
  margin: 0 auto;
}
.hero-v2__phone-notch {
  width: 70px;
  height: 5px;
  background: #475569;
  border-radius: 3px;
  margin: 0 auto 10px;
}
.hero-v2__phone-screen {
  background: #fff;
  border-radius: 18px;
  padding: 0.9rem;
  font-size: 0.7rem;
}
.hero-v2__phone-counter {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--text-3);
  text-align: right;
  margin-bottom: 4px;
}
.hero-v2__phone-progress {
  height: 3px;
  background: #e2e8f0;
  border-radius: 2px;
  margin-bottom: 8px;
}
.hero-v2__phone-progress-fill {
  height: 100%;
  width: 25%;
  background: var(--gradient-brand);
  border-radius: 2px;
}
.hero-v2__phone-label {
  font-size: 0.55rem;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 2px;
  font-weight: 600;
}
.hero-v2__phone-sentence {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f8fafc;
  border-radius: 8px;
  padding: 6px 8px;
  margin-bottom: 6px;
}
.hero-v2__phone-sentence span:first-child {
  font-weight: 700;
  font-size: 0.7rem;
  color: var(--text);
}
.hero-v2__phone-speaker {
  font-size: 0.8rem;
  cursor: pointer;
}
.hero-v2__phone-hindi {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 5px 8px;
  color: #166534;
  font-size: 0.65rem;
  margin-bottom: 8px;
}
.hero-v2__phone-listen,
.hero-v2__phone-speak {
  margin-bottom: 6px;
}
.hero-v2__phone-listen p,
.hero-v2__phone-speak p {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--text-3);
  margin: 0 0 3px;
}
.hero-v2__phone-dots {
  display: flex;
  gap: 4px;
}
.hero-v2__phone-dot {
  background: #f1f5f9;
  border-radius: var(--r-full);
  padding: 2px 6px;
  font-size: 0.55rem;
  font-weight: 700;
}
.hero-v2__phone-dot--active {
  background: #dbeafe;
  color: #2563eb;
}
.hero-v2__phone-done {
  background: #dcfce7;
  color: #166534;
  border-radius: 6px;
  padding: 4px 8px;
  text-align: center;
  font-weight: 600;
  font-size: 0.6rem;
  margin-bottom: 4px;
}
.hero-v2__phone-next {
  text-align: center;
  color: var(--c-sky);
  font-weight: 700;
  font-size: 0.6rem;
}

/* Girl illustration (CSS art) */
.hero-v2__girl {
  position: absolute;
  top: -30px;
  right: -20px;
  z-index: 1;
}
.hero-v2__girl-head {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 50%;
  position: relative;
}
.hero-v2__girl-head::before {
  content: '';
  position: absolute;
  top: -10px;
  left: -5px;
  right: -5px;
  height: 50px;
  background: #1e293b;
  border-radius: 50% 50% 0 0;
}
.hero-v2__girl-body {
  width: 100px;
  height: 120px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px 12px 0 0;
  margin: -10px auto 0;
}
.hero-v2__girl-book {
  position: absolute;
  width: 40px;
  height: 50px;
  background: #10b981;
  border-radius: 4px;
  border: 2px solid #059669;
}
.hero-v2__girl-book--1 {
  bottom: 20px;
  right: -10px;
  transform: rotate(5deg);
}
.hero-v2__girl-book--2 {
  bottom: 30px;
  right: 5px;
  background: #f59e0b;
  border-color: #d97706;
  transform: rotate(-3deg);
}

/* Sticky notes */
.hero-v2__sticky {
  position: absolute;
  border-radius: 4px;
  padding: 12px 14px;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.4;
  box-shadow: 2px 4px 12px rgba(0,0,0,0.1);
  z-index: 3;
}
.hero-v2__sticky--1 {
  top: 0;
  right: 0;
  background: #fef3c7;
  color: #92400e;
  transform: rotate(3deg);
}
.hero-v2__sticky--2 {
  bottom: 40px;
  left: -10px;
  background: #fce7f3;
  color: #9d174d;
  transform: rotate(-2deg);
  max-width: 140px;
}

/* ═══════════════════════════════════════════
   FEATURES STRIP
   ═══════════════════════════════════════════ */
.features-strip {
  background: var(--text);
  padding: var(--sp-5) 0;
}
.features-strip__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--sp-4);
}
.features-strip__item {
  display: flex;
  align-items: center;
  gap: var(--sp-3);
  color: #fff;
}
.features-strip__icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}
.features-strip__item strong {
  display: block;
  font-size: var(--fs-sm);
}
.features-strip__item small {
  opacity: 0.7;
  font-size: var(--fs-xs);
}

/* ═══════════════════════════════════════════
   SECTION TITLE
   ═══════════════════════════════════════════ */
.section-title {
  text-align: center;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 800;
  margin-bottom: var(--sp-6);
  color: var(--text);
}

/* ═══════════════════════════════════════════
   TESTIMONIAL CARD
   ═══════════════════════════════════════════ */
.testimonial-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: var(--sp-6);
  max-width: 480px;
  margin: 0 auto;
  text-align: center;
  box-shadow: var(--shadow-md);
}
.testimonial-card__quote {
  font-size: 3rem;
  color: var(--c-sky);
  line-height: 1;
  margin-bottom: var(--sp-2);
}
.testimonial-card p {
  font-size: var(--fs-lg);
  font-style: italic;
  line-height: 1.7;
  margin-bottom: var(--sp-4);
  color: var(--text);
}
.testimonial-card__author {
  font-weight: 700;
  font-size: var(--fs-sm);
  color: var(--text-3);
}

/* ═══════════════════════════════════════════
   WADA GRID
   ═══════════════════════════════════════════ */
.wada-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--sp-4);
  max-width: 600px;
  margin: 0 auto;
}
.wada-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  padding: var(--sp-5);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.wada-card__icon {
  font-size: 1.75rem;
  display: block;
  margin-bottom: var(--sp-2);
}
.wada-card strong {
  display: block;
  margin-bottom: 4px;
}
.wada-card small {
  color: var(--text-3);
  font-size: var(--fs-sm);
}

/* ═══════════════════════════════════════════
   MOBILE HERO V2
   ═══════════════════════════════════════════ */
@media (max-width: 767px) {
  .hero-v2 { padding: var(--sp-5) 0 var(--sp-4); }
  .hero-v2__grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: var(--sp-6);
    min-height: auto;
  }
  .hero-v2__left { order: 1; }
  .hero-v2__right { order: 2; }
  .hero-v2__steps { justify-content: center; }
  .hero-v2__desc { margin-left: auto; margin-right: auto; }
  .hero-v2__cta-card { margin: 0 auto; max-width: 100%; }
  .hero-v2__right { min-height: 300px; }
  .hero-v2__phone { max-width: 200px; }
  .hero-v2__visual { max-width: 280px; margin: 0 auto; }
  .hero-v2__girl { display: none; }
  .hero-v2__sticky--1 { display: none; }
  .hero-v2__sticky--2 { display: none; }

  /* Features strip mobile */
  .features-strip__grid {
    grid-template-columns: 1fr 1fr;
    gap: var(--sp-3);
  }
  .features-strip__item { flex-direction: column; text-align: center; }

  /* Wada grid mobile */
  .wada-grid { grid-template-columns: 1fr; max-width: 300px; }

  /* Testimonial mobile */
  .testimonial-card { padding: var(--sp-5); }

  /* Section title mobile */
  .section-title { font-size: 1.25rem; }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .hero-v2__grid { gap: var(--sp-6); }
  .hero-v2__phone { max-width: 200px; }
  .hero-v2__girl { display: none; }
  .hero-v2__sticky--1, .hero-v2__sticky--2 { display: none; }
}
`;

css += heroV2CSS;
fs.writeFileSync(file, css, 'utf8');
console.log('✅ Hero V2 CSS added to pages.css');
