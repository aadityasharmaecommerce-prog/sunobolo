import { readFileSync, writeFileSync } from 'node:fs';

const file = 'src/styles/pages.css';
let c = readFileSync(file, 'utf8');

if (c.includes('.hero-new')) {
  console.log('CSS already exists');
  process.exit(0);
}

const css = `

/* ═══════════════════════════════════════════
   NEW HOMEPAGE SECTIONS
   ═══════════════════════════════════════════ */

/* ─── Hero New ─── */
.hero-new {
  background: radial-gradient(1200px 500px at 80% -10%, rgba(14, 165, 233, 0.12), transparent),
    radial-gradient(800px 400px at 10% 0%, rgba(99, 102, 241, 0.08), transparent),
    var(--bg);
  padding: var(--sp-8) 0;
}
.hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-8); align-items: center; }
.hero-badge {
  display: inline-block; background: rgba(14, 165, 233, 0.1); color: var(--c-sky-dark);
  font-weight: 700; font-size: var(--fs-xs); padding: 6px 14px; border-radius: var(--r-full);
  margin-bottom: var(--sp-4); text-transform: uppercase; letter-spacing: 0.06em;
}
.hero-headline { font-size: clamp(1.75rem, 4vw, 2.75rem); font-weight: 800; line-height: 1.2; margin-bottom: var(--sp-4); }
.hero-headline--accent { background: var(--gradient-brand); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero-sub { font-size: var(--fs-lg); color: var(--text); margin-bottom: var(--sp-3); line-height: 1.6; }
.hero-desc { color: var(--text-3); margin-bottom: var(--sp-5); line-height: 1.6; max-width: 480px; }
.hero-cta { margin-bottom: var(--sp-3); }
.hero-trust { display: flex; gap: var(--sp-4); margin-bottom: var(--sp-3); flex-wrap: wrap; }
.hero-trust span { font-size: var(--fs-sm); color: var(--c-success, #16a34a); font-weight: 600; }
.hero-secondary { font-size: var(--fs-sm); color: var(--text-3); }

/* ─── Phone Mockup ─── */
.hero-right { display: flex; justify-content: center; }
.hero-phone { text-align: center; }
.phone-frame {
  width: 260px; background: #1e293b; border-radius: 28px; padding: 12px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.15); position: relative;
}
.phone-notch {
  width: 80px; height: 6px; background: #475569; border-radius: 3px;
  margin: 0 auto 12px;
}
.phone-screen { background: #fff; border-radius: 18px; padding: 1.25rem; min-height: 200px; }
.phone-sentence { margin-bottom: 1rem; }
.phone-english { font-size: 1.1rem; font-weight: 700; margin-bottom: .25rem; }
.phone-hindi { font-size: .85rem; color: var(--text-3); }
.phone-counters { display: flex; gap: .75rem; margin-bottom: .75rem; }
.phone-counter {
  background: #f1f5f9; padding: .35rem .75rem; border-radius: var(--r-full);
  font-size: .75rem; font-weight: 700;
}
.phone-counter--done { background: #dcfce7; color: #166534; }
.phone-progress { height: 4px; background: #e2e8f0; border-radius: 2px; }
.phone-progress-fill { height: 100%; background: var(--c-primary); border-radius: 2px; }
.phone-flow { display: flex; gap: .75rem; justify-content: center; margin-top: 1rem; flex-wrap: wrap; }
.phone-flow-item {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full);
  padding: .35rem .75rem; font-size: .75rem; font-weight: 600; box-shadow: var(--shadow-sm);
}

/* ─── Trust Strip ─── */
.trust-strip { background: var(--text); color: #fff; padding: var(--sp-5) 0; text-align: center; }
.trust-strip__label { font-size: var(--fs-sm); color: rgba(255,255,255,0.6); margin-bottom: var(--sp-3); text-transform: uppercase; letter-spacing: 0.1em; }
.trust-strip__flow { display: flex; align-items: center; justify-content: center; gap: var(--sp-3); flex-wrap: wrap; font-weight: 700; font-size: var(--fs-sm); }
.trust-strip__arrow { color: var(--c-sky); font-size: 1.25rem; }
.trust-strip__sub { font-size: var(--fs-xs); color: rgba(255,255,255,0.5); margin-top: var(--sp-2); }

/* ─── Problem Cards ─── */
.problem-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-4); max-width: 600px; margin: 0 auto var(--sp-6); }
.problem-card-new { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; text-align: center; box-shadow: var(--shadow-sm); }
.problem-card-new__emoji { font-size: 2rem; display: block; margin-bottom: .5rem; }
.problem-card-new p { font-size: .95rem; line-height: 1.5; margin: 0; }
.problem-solution { font-size: var(--fs-lg); font-weight: 600; margin-bottom: var(--sp-5); line-height: 1.6; }

/* ─── How Steps ─── */
.how-steps { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); max-width: 500px; margin: 0 auto var(--sp-5); }
.how-step { width: 100%; background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; text-align: center; box-shadow: var(--shadow-sm); position: relative; }
.how-step__num { position: absolute; top: .75rem; left: 1rem; font-size: var(--fs-xs); font-weight: 800; color: var(--c-sky); }
.how-step__icon { font-size: 2rem; margin-bottom: .5rem; }
.how-step h3 { margin-bottom: .25rem; }
.how-step p { font-size: var(--fs-sm); color: var(--text-3); margin: 0; }
.how-step__arrow { font-size: 1.5rem; color: var(--c-sky); }
.how-note { font-size: var(--fs-sm); color: var(--text-3); margin-top: var(--sp-3); }

/* ─── Demo Mockup ─── */
.demo-mockup { display: flex; justify-content: center; }
.demo-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-xl); padding: 2rem; max-width: 400px; width: 100%; box-shadow: var(--shadow-md); }
.demo-english { font-size: 1.5rem; font-weight: 700; margin-bottom: .25rem; }
.demo-hindi { font-size: 1.1rem; color: var(--text-3); margin-bottom: 1.5rem; }
.demo-phase { margin-bottom: 1rem; }
.demo-phase__label { font-weight: 600; font-size: var(--fs-sm); margin-bottom: .5rem; display: block; }
.demo-dots { display: flex; gap: .5rem; }
.demo-dot { width: 60px; padding: .35rem; text-align: center; border-radius: var(--r-full); border: 2px solid var(--border); font-size: var(--fs-sm); font-weight: 700; color: var(--text-3); }
.demo-dot--done { background: #10b981; border-color: #10b981; color: #fff; }
.demo-dot--active { border-color: var(--c-primary); color: var(--c-primary); }
.demo-done { text-align: center; font-weight: 600; color: var(--c-success, #16a34a); margin-bottom: .5rem; }
.demo-next { text-align: center; font-weight: 700; color: var(--c-primary); }

/* ─── Real-Life Grid ─── */
.reallife-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--sp-4); max-width: 800px; margin: 0 auto; }
.reallife-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; text-align: center; box-shadow: var(--shadow-sm); transition: box-shadow .2s, transform .15s; }
.reallife-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.reallife-card__emoji { font-size: 1.75rem; display: block; margin-bottom: .5rem; }
.reallife-card h4 { margin-bottom: .25rem; font-size: .95rem; }
.reallife-card p { font-size: var(--fs-sm); color: var(--text-3); margin: 0; font-style: italic; }

/* ─── Who Grid ─── */
.who-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); max-width: 600px; margin: 0 auto var(--sp-6); }
.who-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; text-align: center; box-shadow: var(--shadow-sm); transition: box-shadow .2s, transform .15s; }
.who-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.who-card__emoji { font-size: 2rem; display: block; margin-bottom: .5rem; }
.who-card h4 { margin-bottom: .25rem; }
.who-card p { font-size: var(--fs-sm); color: var(--text-3); margin: 0; }

/* ─── Roadmap ─── */
.roadmap { display: flex; flex-direction: column; align-items: center; gap: var(--sp-3); margin-bottom: var(--sp-5); }
.roadmap__main { display: flex; flex-direction: column; align-items: center; gap: var(--sp-2); }
.roadmap-node { padding: .75rem 2rem; border-radius: var(--r-full); font-weight: 700; font-size: var(--fs-sm); border: 2px solid var(--border); min-width: 180px; text-align: center; }
.roadmap-node--green { border-color: #10b981; color: #10b981; }
.roadmap-node--yellow { border-color: #f59e0b; color: #f59e0b; }
.roadmap-node--blue { border-color: #3b82f6; color: #3b82f6; }
.roadmap-arrow { color: var(--text-3); font-size: 1.25rem; }
.roadmap__special { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; }
.roadmap__special span { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); padding: .35rem .75rem; font-size: var(--fs-xs); font-weight: 600; }
.roadmap__note { font-size: var(--fs-sm); color: var(--text-3); }

/* ─── Preview Grid ─── */
.preview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--sp-4); max-width: 700px; margin: 0 auto; }
.preview-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.25rem; box-shadow: var(--shadow-sm); }
.preview-card h3 { margin-bottom: .75rem; font-size: 1rem; }
.preview-card ul { list-style: none; padding: 0; margin: 0; }
.preview-card li { padding: .3rem 0; font-size: var(--fs-sm); color: var(--text-2); }

/* ─── Free Trial Section ─── */
.section--trial { background: linear-gradient(135deg, #ecfdf5 0%, #f0f9ff 100%); }
.trial-subtitle { font-size: var(--fs-xl); margin-bottom: var(--sp-3); }
.trial-desc { color: var(--text-3); margin-bottom: var(--sp-5); max-width: 480px; margin-left: auto; margin-right: auto; }
.trial-method { display: flex; gap: var(--sp-4); justify-content: center; margin-bottom: var(--sp-5); flex-wrap: wrap; }
.trial-method span { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); padding: .5rem 1rem; font-weight: 700; font-size: var(--fs-sm); box-shadow: var(--shadow-sm); }
.trial-note { font-size: var(--fs-xs); color: var(--text-3); margin-top: var(--sp-3); }

/* ─── Continue Flow ─── */
.continue-flow { display: flex; align-items: center; justify-content: center; gap: var(--sp-3); margin-bottom: var(--sp-4); flex-wrap: wrap; }
.continue-flow span { font-weight: 700; }
.continue-arrow { color: var(--c-sky); }
.continue-special { display: flex; gap: .75rem; flex-wrap: wrap; justify-content: center; margin-bottom: var(--sp-5); }
.continue-special span { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); padding: .35rem .75rem; font-size: var(--fs-xs); font-weight: 600; }

/* ─── Aspiration Scenarios ─── */
.aspiration-scenarios { display: flex; gap: var(--sp-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--sp-4); }
.aspiration-scenario { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); padding: .5rem 1rem; font-weight: 600; font-size: var(--fs-sm); box-shadow: var(--shadow-sm); }

/* ─── Kids Flow ─── */
.kids-flow { display: flex; gap: var(--sp-4); justify-content: center; flex-wrap: wrap; margin-bottom: var(--sp-5); }
.kids-flow span { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-full); padding: .5rem 1rem; font-weight: 600; font-size: var(--fs-sm); box-shadow: var(--shadow-sm); }

/* ─── Benefits Grid ─── */
.benefits-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--sp-3); max-width: 400px; margin: 0 auto var(--sp-5); }
.benefit-item { font-size: var(--fs-sm); font-weight: 600; }

/* ─── Compare Grid ─── */
.compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--sp-4); max-width: 500px; margin: 0 auto; }
.compare-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--r-lg); padding: 1.5rem; text-align: center; }
.compare-card h4 { margin-bottom: .75rem; }
.compare-card p { margin: .35rem 0; font-size: var(--fs-sm); color: var(--text-2); }
.compare-card--old { opacity: .7; }
.compare-card--new { border-color: var(--c-primary); box-shadow: var(--shadow-md); }

/* ─── FAQ ─── */
.faq-list { max-width: 600px; margin: 0 auto; }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-question { padding: 1rem 0; font-weight: 600; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; }
.faq-question::after { content: '+'; font-size: 1.25rem; color: var(--c-sky); }
.faq-item[open] .faq-question::after { content: '\\2212'; }
.faq-answer { padding: 0 0 1rem; color: var(--text-2); line-height: 1.6; font-size: var(--fs-sm); }

/* ─── Final CTA ─── */
.section--final-cta { background: var(--gradient-brand); }
.final-cta { text-align: center; color: #fff; }
.final-cta h2 { color: #fff; }
`;

c += css;
writeFileSync(file, c);
console.log('added new homepage CSS');
