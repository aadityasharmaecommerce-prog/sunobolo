import { ROUTES } from '@/constants';
import { usePageMeta } from '@/hooks/usePageMeta';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  usePageMeta('404 — SunoBolo English', 'Page nahi mila.');
  return (
    <div className="container section">
      <div className="state">
        <span className="state__emoji" aria-hidden="true">🫥</span>
        <h1>404 — Yeh page nahi mila</h1>
        <p>Jo page aap dhoondh rahe hain woh exist nahi karta. Home par wapas chalein.</p>
        <div className="flex" style={{ justifyContent: 'center' }}>
          <Button to={ROUTES.home}>Home</Button>
          <Button variant="outline" to={ROUTES.courses}>All Courses</Button>
        </div>
      </div>
    </div>
  );
}
