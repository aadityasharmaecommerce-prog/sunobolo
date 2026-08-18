import { Button } from './Button';

interface LockedOverlayProps {
  title?: string;
  message?: string;
}

export function LockedOverlay({
  title = 'Yeh lesson locked hai 🔒',
  message = 'Is content ko kholne ke liye ek package chahiye. FREE plan mein bhi bahut kuch available hai!',
}: LockedOverlayProps) {
  return (
    <div className="locked-overlay" role="dialog" aria-label={title}>
      <span className="locked-overlay__icon" aria-hidden="true">
        🔒
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      <div className="locked-overlay__actions">
        <Button to="/pricing" size="lg">
          See Packages
        </Button>
      </div>
    </div>
  );
}
