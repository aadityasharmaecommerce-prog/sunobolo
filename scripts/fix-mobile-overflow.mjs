import fs from 'fs';

// ─── FIX base.css ───
const baseFile = 'src/styles/base.css';
let base = fs.readFileSync(baseFile, 'utf8');

// Ensure html/body have proper width constraints
if (!base.includes('#root')) {
  base = base.replace(
    'body {\n  font-family',
    'html,\nbody,\n#root {\n  width: 100%;\n  max-width: 100%;\n  margin: 0;\n  padding: 0;\n  overflow-x: hidden;\n}\n\nbody {\n  font-family'
  );
  // Remove the separate html overflow-x: hidden (we now have it in the block above)
  base = base.replace(/html \{\n  overflow-x: hidden;/, 'html {');
  fs.writeFileSync(baseFile, base, 'utf8');
  console.log('✅ base.css: Added #root width constraints');
}

// ─── FIX layout.css — bottom nav ───
const layoutFile = 'src/styles/layout.css';
let layout = fs.readFileSync(layoutFile, 'utf8');

// Ensure bottom nav doesn't use 100vw
if (layout.includes('width: 100vw')) {
  layout = layout.replace(/width:\s*100vw/g, 'width: 100%');
  fs.writeFileSync(layoutFile, layout, 'utf8');
  console.log('✅ layout.css: Fixed bottom nav width');
}

// ─── FIX responsive.css ───
const responsiveFile = 'src/styles/responsive.css';
let responsive = fs.readFileSync(responsiveFile, 'utf8');

// Add comprehensive mobile overflow fixes at the end
const mobileFix = `

/* ═══════════════════════════════════════════
   COMPREHENSIVE MOBILE OVERFLOW FIX
   ═══════════════════════════════════════════ */

/* Global mobile safety */
@media (max-width: 767px) {
  /* Ensure nothing overflows */
  html, body, #root {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  .app-shell {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
  }
  .app-main {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  /* Container safety */
  .container {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    padding-left: 1rem;
    padding-right: 1rem;
    overflow-wrap: anywhere;
  }

  /* All sections */
  section {
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  /* Header */
  .header {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }
  .header__inner {
    padding-left: 1rem;
    padding-right: 1rem;
    min-width: 0;
  }
  .header__actions {
    min-width: 0;
    gap: 0.35rem;
  }

  /* Hero V2 */
  .hero-v2 {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 1rem 0;
  }
  .hero-v2__grid {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 1.5rem;
    min-height: auto;
  }
  .hero-v2__left {
    order: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .hero-v2__right {
    order: 2;
    min-height: auto;
    min-width: 0;
    width: 100%;
    display: flex;
    justify-content: center;
  }
  .hero-v2__badge {
    display: inline-block;
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .hero-v2__title {
    font-size: clamp(1.4rem, 7vw, 2rem);
    line-height: 1.2;
    word-break: break-word;
    overflow-wrap: anywhere;
    max-width: 100%;
  }
  .hero-v2__steps {
    justify-content: center;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .hero-v2__steps span {
    font-size: 0.85rem;
    white-space: nowrap;
  }
  .hero-v2__desc {
    max-width: 100%;
    overflow-wrap: anywhere;
  }
  .hero-v2__cta-card {
    max-width: 100%;
    width: 100%;
    padding: 1rem 1.25rem;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .hero-v2__cta-left strong {
    font-size: var(--fs-md);
  }
  .hero-v2__cta-left small {
    font-size: 0.65rem;
  }

  /* Hero illustration */
  .hero-v2__illustration {
    max-width: min(280px, calc(100vw - 40px));
    width: 100%;
    height: auto;
  }

  /* Features strip */
  .features-strip {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    padding: 1rem 0;
  }
  .features-strip__grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .features-strip__item {
    flex-direction: column;
    text-align: center;
    min-width: 0;
    gap: 0.35rem;
  }
  .features-strip__item strong {
    font-size: 0.75rem;
  }
  .features-strip__item small {
    font-size: 0.65rem;
  }

  /* All grids — force single/2-col on mobile */
  .reallife-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .who-grid {
    grid-template-columns: 1fr 1fr;
    gap: 0.75rem;
  }
  .home-courses {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .problem-cards {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .benefits-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .compare-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .preview-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .wada-grid {
    grid-template-columns: 1fr;
    max-width: 260px;
    gap: 0.75rem;
  }

  /* All cards — no min-width */
  .reallife-card,
  .who-card,
  .problem-card-new,
  .preview-card,
  .wada-card,
  .course-card,
  .card {
    min-width: 0;
    width: 100%;
    max-width: 100%;
    overflow-wrap: anywhere;
  }

  /* How steps */
  .how-steps {
    gap: 0.5rem;
  }
  .how-step {
    padding: 1rem;
    min-width: 0;
  }
  .how-step__icon {
    font-size: 1.5rem;
  }
  .how-step h3 {
    font-size: 0.95rem;
  }
  .how-step p {
    font-size: 0.75rem;
  }
  .how-step__arrow {
    font-size: 1rem;
  }

  /* Demo mockup */
  .demo-card {
    padding: 1.25rem;
    max-width: 100%;
    min-width: 0;
  }
  .demo-english {
    font-size: 1.25rem;
  }
  .demo-hindi {
    font-size: 1rem;
  }

  /* Trial method */
  .trial-method {
    gap: 0.5rem;
    flex-wrap: wrap;
  }
  .trial-method span {
    font-size: 0.75rem;
    padding: 0.4rem 0.75rem;
  }

  /* Section titles */
  .section-title {
    font-size: 1.25rem;
    overflow-wrap: anywhere;
  }

  /* Testimonial */
  .testimonial-card {
    max-width: 100%;
    min-width: 0;
    padding: 1.25rem;
  }

  /* Final CTA */
  .final-cta h2 {
    font-size: 1.25rem;
    overflow-wrap: anywhere;
  }

  /* Roadmap */
  .roadmap__special {
    gap: 0.5rem;
  }
  .roadmap__special span {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }

  /* Continue flow */
  .continue-flow {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .continue-flow span {
    font-size: 0.85rem;
  }
  .continue-special {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .continue-special span {
    font-size: 0.6rem;
    padding: 0.2rem 0.4rem;
  }

  /* Aspiration */
  .aspiration-scenarios {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .aspiration-scenario {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  /* Kids flow */
  .kids-flow {
    gap: 0.5rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .kids-flow span {
    padding: 0.4rem 0.75rem;
    font-size: 0.75rem;
  }

  /* FAQ */
  .faq-list {
    padding: 0;
  }
  .faq-question {
    font-size: 0.85rem;
  }
  .faq-answer {
    font-size: 0.8rem;
  }

  /* All images/SVGs */
  img, svg {
    max-width: 100%;
    height: auto;
  }

  /* All buttons */
  .btn--lg {
    padding: 0.75rem 1.25rem;
    font-size: 1rem;
    width: 100%;
    max-width: 100%;
  }
}

/* Very small phones (320px) */
@media (max-width: 340px) {
  .hero-v2__title {
    font-size: 1.3rem;
  }
  .hero-v2__steps span {
    font-size: 0.75rem;
  }
  .features-strip__grid {
    grid-template-columns: 1fr;
  }
  .reallife-grid {
    grid-template-columns: 1fr;
  }
  .who-grid {
    grid-template-columns: 1fr;
  }
  .btn--lg {
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
  }
}

/* Desktop must not break */
@media (min-width: 768px) {
  .hero-v2__grid {
    grid-template-columns: 1fr 1fr;
    min-height: 480px;
  }
  .hero-v2__left {
    order: 1;
  }
  .hero-v2__right {
    order: 2;
    min-height: 420px;
  }
  .features-strip__grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .reallife-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .who-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .home-courses {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
  .wada-grid {
    grid-template-columns: repeat(3, 1fr);
    max-width: 600px;
  }
  .problem-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .preview-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .compare-grid {
    grid-template-columns: 1fr 1fr;
  }
  .benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
`;

if (!responsive.includes('COMPREHENSIVE MOBILE OVERFLOW FIX')) {
  responsive += mobileFix;
  fs.writeFileSync(responsiveFile, responsive, 'utf8');
  console.log('✅ responsive.css: Added comprehensive mobile overflow fix');
}
