import { useState, useEffect, useCallback, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Headphones, User, Menu, X, BookOpen, GraduationCap, Mic, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../lib/auth';
import BottomNav from './BottomNav';
import NotificationPrompt from './NotificationPrompt';

export default function Layout() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/lesson/') || location.pathname === '/onboarding' || location.pathname === '/free-trial';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const { subscription } = useAuth();
  const isPaid = subscription.active;

  const NAV_ITEMS = [
    { label: 'Home', path: '/', icon: Target },
    { label: 'Learn', path: '/courses', icon: GraduationCap },
    ...(!isPaid ? [{ label: 'Practice', path: '/free-trial', icon: Mic }] : []),
    { label: 'Reading', path: '/reading', icon: BookOpen },
    { label: 'Journey', path: '/journey', icon: TrendingUp },
    ...(!isPaid ? [{ label: 'Pricing', path: '/pricing', icon: null }] : []),
  ];

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  // Close on Escape key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && mobileMenuOpen) {
      setMobileMenuOpen(false);
      hamburgerRef.current?.focus();
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Close menu on outside click
  const handleOverlayClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  // Handle menu link click — close menu and navigate
  const handleMenuLinkClick = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  return (
    <div className="min-h-screen dark-page" style={{ fontFamily: 'var(--font-sans)' }}>
      {/* ── Premium Floating Header ── */}
      <header className="sticky top-0 z-40 dark-glass-nav">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 active:scale-[0.97] transition-transform shrink-0">
            <img
              src="/images/logo.png"
              alt="SunoBolo English"
              className="h-10 w-auto object-contain"
              style={{ maxHeight: '40px' }}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden sm:flex items-center gap-0.5 ml-8">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`px-3.5 py-2 text-[13px] font-semibold rounded-lg transition-all ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            {!isPaid && (
            <Link
              to="/free-trial"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-[13px] font-bold rounded-full transition-all text-white bg-gradient-to-r from-brand-500 to-accent-500 hover:from-brand-600 hover:to-accent-600 shadow-[0_4px_16px_-4px_rgba(108,77,255,0.5)]"
            >
              <Headphones size={15} strokeWidth={2.5} />
              Try 25 Free Sentences
            </Link>
            )}
            <Link
              to="/profile"
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all bg-white/8 text-white/70 border border-white/8 hover:bg-white/12 hover:text-white hover:border-white/15"
              aria-label="Profile"
            >
              <User size={17} strokeWidth={2} />
            </Link>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            ref={hamburgerRef}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden relative w-11 h-11 flex items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            {mobileMenuOpen ? (
              <X size={22} strokeWidth={2.5} />
            ) : (
              <Menu size={22} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </header>

      {/* ── Mobile Navigation Menu ── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm sm:hidden"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div
            id="mobile-nav-menu"
            ref={menuRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="fixed top-16 left-0 right-0 z-50 sm:hidden animate-fade-in"
          >
            <div className="mx-3 mt-2 rounded-2xl border border-white/[0.06] shadow-[0_16px_48px_-12px_rgba(0,0,0,0.6)] overflow-hidden"
              style={{ background: 'rgba(12, 9, 32, 0.97)', backdropFilter: 'blur(24px)' }}>

              {/* Nav links with icons */}
              <nav className="py-2" role="navigation" aria-label="Mobile navigation">
                {NAV_ITEMS.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={handleMenuLinkClick}
                      className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'text-white bg-white/[0.08]'
                          : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                      }`}
                    >
                      {Icon && (
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-[#6C4DFF]/20' : 'bg-white/[0.05]'
                        }`}>
                          <Icon size={16} strokeWidth={2} className={isActive ? 'text-brand-300' : 'text-white/40'} />
                        </span>
                      )}
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-400" />}
                    </Link>
                  );
                })}

                {/* Divider */}
                <div className="mx-5 my-1 border-t border-white/[0.06]" />

                {/* CTA — only for free users */}
                {!isPaid && (
                  <>
                    <Link
                      to="/free-trial"
                      onClick={handleMenuLinkClick}
                      className="flex items-center gap-3.5 px-5 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/[0.04]"
                    >
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center shrink-0">
                        <Headphones size={15} strokeWidth={2.5} />
                      </span>
                      Try 25 Free Sentences
                    </Link>
                    <div className="mx-5 my-1 border-t border-white/[0.06]" />
                  </>
                )}

                {/* Profile / Login */}
                <Link
                  to="/profile"
                  onClick={handleMenuLinkClick}
                  className={`flex items-center gap-3.5 px-5 py-3.5 text-sm font-semibold transition-colors ${
                    location.pathname === '/profile'
                      ? 'text-white bg-white/[0.08]'
                      : 'text-white/60 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    location.pathname === '/profile' ? 'bg-[#6C4DFF]/20' : 'bg-white/[0.05]'
                  }`}>
                    <User size={15} strokeWidth={2} className={location.pathname === '/profile' ? 'text-brand-300' : 'text-white/40'} />
                  </span>
                  Profile
                </Link>

                {/* Divider */}
                <div className="mx-5 my-1 border-t border-white/[0.06]" />


              </nav>
            </div>
          </div>
        </>
      )}

      <main className="max-w-2xl mx-auto px-4 pb-28 pt-4 sm:max-w-6xl">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-white/[0.06] py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <img src="/images/logo.png" alt="SunoBolo" className="h-8 w-auto object-contain" />
            </Link>

            {/* Policy Links */}
            <div className="flex items-center gap-3 text-[11px] text-white/30 font-medium">
              <Link to="/privacy-policy" className="hover:text-white/50 transition-colors">Privacy Policy</Link>
              <span className="text-white/10">|</span>
              <Link to="/disclaimer" className="hover:text-white/50 transition-colors">Disclaimer</Link>
              <span className="text-white/10">|</span>
              <Link to="/refund-policy" className="hover:text-white/50 transition-colors">Refund Policy</Link>
            </div>
            <p className="text-[11px] text-white/30">
              Made with ❤️ by <span className="font-semibold text-white/50">Pankaj Upadhyay</span>
            </p>
          </div>
        </div>
      </footer>

      {!hideNav && <BottomNav />}
      <NotificationPrompt />
    </div>
  );
}
