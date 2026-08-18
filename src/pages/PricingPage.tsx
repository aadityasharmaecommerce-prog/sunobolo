import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Package } from '@/types';
import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { packagesService } from '@/services/packagesService';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/States';

export function PricingPage() {
  usePageMeta(
    'Pricing — SunoBolo English',
    'FREE se shuru karo. Complete English ₹499, Professional ₹599, Complete Pack ₹799 — lifetime access, koi hidden charges nahi.',
  );

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);
  const { user, isAuthenticated, setUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    packagesService
      .getPackages()
      .then((data) => !cancelled && setPackages(data))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const handleBuy = async (pkg: Package) => {
    if (!isAuthenticated) {
      toast('Pehle login ya signup karein — sirf 10 second lagenge.', 'info');
      navigate(ROUTES.login);
      return;
    }
    setBuying(pkg.id);
    try {
      const res = await packagesService.purchase(pkg.id);
      if (res.ok) {
        toast(res.message);
        // Re-read the user from storage so lock states update immediately.
        setUser(authService.getCurrentUser());
      } else {
        toast(res.message, 'error');
      }
    } catch {
      toast('Purchase fail ho gaya. Dobara try karein.', 'error');
    } finally {
      setBuying(null);
    }
  };

  return (
    <div className="container section">
      <div className="section__head">
        <p className="eyebrow">Pricing</p>
        <h1 className="section__title">Ek chhota investment, lifetime confidence</h1>
        <p className="section__subtitle">
          FREE plan mein hi 3 courses hain. Upgrade kabhi bhi karo — sab plans lifetime access ke saath.
        </p>
      </div>

      {loading ? (
        <LoadingState label="Packages load ho rahe hain…" />
      ) : error ? (
        <ErrorState onRetry={() => window.location.reload()} />
      ) : (
        <>
          <div className="pricing-grid">
            {packages.map((pkg) => {
              const owned = user?.hasPackage === pkg.id;
              return (
                <div key={pkg.id} className={`pricing-card ${pkg.popular ? 'pricing-card--popular' : ''}`}>
                  {pkg.popular && <span className="pricing-card__flag">Most Popular</span>}
                  <h3 className="pricing-card__name">{pkg.name}</h3>
                  <div className="pricing-card__price">
                    <span className="pricing-card__amount">
                      {pkg.price === 0 ? 'FREE' : `${pkg.currency}${pkg.price}`}
                    </span>
                    {pkg.originalPrice > pkg.price && (
                      <span className="pricing-card__original">{pkg.currency}{pkg.originalPrice}</span>
                    )}
                  </div>
                  <p className="pricing-card__tagline">{pkg.tagline}</p>
                  <ul>
                    {pkg.features.map((f) => (
                      <li key={f}>
                        <span aria-hidden="true">✅</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={pkg.price === 0 ? 'outline' : 'primary'}
                    size="lg"
                    fullWidth
                    disabled={buying === pkg.id}
                    onClick={() => handleBuy(pkg)}
                  >
                    {owned
                      ? '✓ Active'
                      : buying === pkg.id
                        ? 'Processing…'
                        : pkg.price === 0
                          ? 'Start Free'
                          : `Buy ${pkg.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
          <p className="pricing-note">
            ⚠️ Phase 1 demo: purchase mock hai — koi real payment nahi hota. Phase 2 mein real gateway (Razorpay/Stripe) connect hoga.
          </p>
        </>
      )}
    </div>
  );
}
