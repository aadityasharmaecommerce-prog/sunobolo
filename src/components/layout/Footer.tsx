import { Link } from 'react-router-dom';
import { APP, CATEGORY_PAGES, ROUTES } from '@/constants';

export function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__col footer__col--brand">
          <div className="brand">
            <span className="brand__logo" aria-hidden="true">
              <svg viewBox="0 0 64 64" width="26" height="26" focusable="false">
                <rect width="64" height="64" rx="14" fill="var(--c-sky)" />
                <path d="M14 26v12h8l10 8V18l-10 8h-8z" fill="#fff" />
                <path d="M40 24c2.5 2.4 3.9 5.6 3.9 9s-1.4 6.6-3.9 9" fill="none" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" />
              </svg>
            </span>
            <span className="brand__text">
              <strong>SunoBolo</strong>
              <em>English</em>
            </span>
          </div>
          <p className="footer__tagline">{APP.tagline} {APP.supporting}</p>
          <p className="footer__note">Roz sirf 10–15 minute practice karke English speaking improve karein.</p>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Learn</h4>
          <ul className="footer__links">
            {CATEGORY_PAGES.slice(0, 7).map((p) => (
              <li key={p.slug}>
                <Link to={`/${p.slug}`}>{p.heading}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">Company</h4>
          <ul className="footer__links">
            <li><Link to={ROUTES.courses}>All Courses</Link></li>
            <li><Link to={ROUTES.pricing}>Pricing</Link></li>
            <li><Link to={ROUTES.onboarding}>Start Onboarding</Link></li>
            <li><Link to={ROUTES.login}>Login</Link></li>
            <li><Link to={ROUTES.signup}>Sign up</Link></li>
          </ul>
        </div>

        <div className="footer__col">
          <h4 className="footer__heading">The Method</h4>
          <ul className="footer__steps">
            <li>🔊 Suno 3 baar</li>
            <li>🎤 Bolo 3 baar</li>
            <li>➡️ Next sentence</li>
          </ul>
        </div>
      </div>
      <div className="footer__bottom container">
        <p>© {new Date().getFullYear()} {APP.name}. Made in India 🇮🇳 — Suno. Bolo. Repeat Karo.</p>
        <p className="footer__credit">Made with <span aria-hidden="true">❤️</span> by Pankaj Upadhyay</p>
      </div>
    </footer>
  );
}
