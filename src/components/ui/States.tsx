import { Button } from './Button';

export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <span className="spinner" style={{ width: size, height: size }} role="status" aria-label="Loading">
      <span className="spinner__ring" />
    </span>
  );
}

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state state--loading" role="status">
      <Spinner />
      <p>{label}</p>
    </div>
  );
}

interface EmptyStateProps {
  emoji?: string;
  title: string;
  message?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
}

export function EmptyState({ emoji = '🗂️', title, message, actionLabel, actionTo, onAction }: EmptyStateProps) {
  return (
    <div className="state">
      <span className="state__emoji" aria-hidden="true">
        {emoji}
      </span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {(actionLabel && (actionTo || onAction)) && (
        <Button variant="primary" to={actionTo} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Kuch galat ho gaya', message = 'Data load nahi ho paya. Dobara try karein.', onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <span className="state__emoji" aria-hidden="true">
        😅
      </span>
      <h3>{title}</h3>
      <p>{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          🔄 Retry
        </Button>
      )}
    </div>
  );
}
