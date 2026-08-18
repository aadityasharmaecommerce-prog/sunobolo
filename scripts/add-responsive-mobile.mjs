import fs from 'fs';
import path from 'path';

const file = path.join('src/styles/responsive.css');
let css = fs.readFileSync(file, 'utf8');

const mobileCSS = `

/* ═══════════════════════════════════════════
   MOBILE-FIRST ENHANCED RESPONSIVE
   ═══════════════════════════════════════════ */

/* 360px — smallest phones */
@media (max-width: 400px) {
  .hero-v2__title { font-size: 1.5rem; }
  .hero-v2__steps span { font-size: 0.85rem; }
  .hero-v2__cta-card { padding: 1rem; }
  .hero-v2__cta-left strong { font-size: var(--fs-md); }
  .features-strip__grid { grid-template-columns: 1fr; gap: var(--sp-2); }
  .reallife-grid { grid-template-columns: 1fr !important; }
  .who-grid { grid-template-columns: 1fr !important; }
  .preview-grid { grid-template-columns: 1fr !important; }
  .problem-cards { grid-template-columns: 1fr !important; }
  .benefits-grid { grid-template-columns: 1fr !important; }
  .compare-grid { grid-template-columns: 1fr !important; }
  .home-courses { grid-template-columns: 1fr !important; }
}

/* 375-430px — standard phones */
@media (min-width: 401px) and (max-width: 767px) {
  .features-strip__grid { grid-template-columns: 1fr 1fr; }
  .reallife-grid { grid-template-columns: repeat(2, 1fr) !important; }
  .who-grid { grid-template-columns: repeat(2, 1fr) !important; }
}

/* Mobile: ensure no horizontal overflow */
@media (max-width: 767px) {
  html, body { overflow-x: hidden; }
  .app-shell { overflow-x: hidden; }
  .hero-v2__visual { overflow: visible; }
  .reallife-grid { gap: var(--sp-3); }
  .reallife-card { padding: 1rem; }
  .reallife-card h4 { font-size: 0.85rem; }
  .reallife-card p { font-size: var(--fs-xs); }
  .who-card { padding: 1rem; }
  .who-card h4 { font-size: 0.9rem; }
  .how-steps { gap: var(--sp-2); }
  .how-step { padding: 1rem; }
  .demo-card { padding: 1.25rem; }
  .preview-card { padding: 1rem; }
  .preview-grid { gap: var(--sp-3); }
  .roadmap__special { gap: var(--sp-2); }
  .roadmap__special span { font-size: 0.65rem; padding: 0.25rem 0.5rem; }
  .continue-flow { gap: var(--sp-2); }
  .continue-flow span { font-size: var(--fs-sm); }
  .continue-special { gap: var(--sp-2); }
  .continue-special span { font-size: 0.65rem; padding: 0.25rem 0.5rem; }
  .aspiration-scenarios { gap: var(--sp-2); }
  .aspiration-scenario { padding: 0.4rem 0.75rem; font-size: var(--fs-xs); }
  .kids-flow { gap: var(--sp-2); }
  .kids-flow span { padding: 0.4rem 0.75rem; font-size: var(--fs-xs); }
  .benefits-grid { gap: var(--sp-2); }
  .benefit-item { font-size: var(--fs-xs); }
  .final-cta h2 { font-size: 1.25rem; }
  .trial-method { gap: var(--sp-2); }
  .trial-method span { font-size: var(--fs-xs); padding: 0.4rem 0.75rem; }
  .faq-list { padding: 0; }
  .faq-question { font-size: var(--fs-sm); padding: 0.75rem 0; }
  .faq-answer { font-size: var(--fs-xs); }
}

/* Tablet */
@media (min-width: 768px) and (max-width: 1023px) {
  .features-strip__grid { grid-template-columns: repeat(2, 1fr); }
  .reallife-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .who-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .home-courses { grid-template-columns: repeat(2, 1fr) !important; }
}

/* Desktop */
@media (min-width: 1024px) {
  .features-strip__grid { grid-template-columns: repeat(4, 1fr); }
  .reallife-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .who-grid { grid-template-columns: repeat(3, 1fr) !important; }
  .home-courses { grid-template-columns: repeat(3, 1fr) !important; }
}
`;

css += mobileCSS;
fs.writeFileSync(file, css, 'utf8');
console.log('✅ Mobile-first responsive CSS added');
