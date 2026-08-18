import fs from 'fs';

const file = 'src/styles/pages.css';
let css = fs.readFileSync(file, 'utf8');

// Remove the old CSS sections for phone, girl, sticky (they're now in the SVG)
const oldSections = [
  '/* Girl illustration (CSS art) */',
  '/* Sticky notes */',
  '.hero-v2__girl',
  '.hero-v2__girl-head',
  '.hero-v2__girl-body',
  '.hero-v2__girl-book',
  '.hero-v2__sticky',
];

// We'll add the illustration CSS and keep the phone CSS as fallback
const illustrationCSS = `
/* ═══════════════════════════════════════════
   HERO ILLUSTRATION
   ═══════════════════════════════════════════ */
.hero-v2__illustration {
  width: 100%;
  max-width: 480px;
  height: auto;
  border-radius: var(--r-xl);
  filter: drop-shadow(0 16px 48px rgba(0,0,0,0.12));
  transition: transform 0.4s ease;
}
.hero-v2__illustration:hover {
  transform: scale(1.02);
}

@media (max-width: 767px) {
  .hero-v2__illustration {
    max-width: 320px;
    margin: 0 auto;
  }
}
@media (max-width: 400px) {
  .hero-v2__illustration {
    max-width: 280px;
  }
}
`;

// Check if illustration CSS already exists
if (!css.includes('hero-v2__illustration')) {
  css += illustrationCSS;
  fs.writeFileSync(file, css, 'utf8');
  console.log('✅ Illustration CSS added');
} else {
  console.log('ℹ️  Illustration CSS already exists');
}
