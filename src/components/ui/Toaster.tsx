import { useToast } from '@/context/ToastContext';

export function Toaster() {
  const { toasts, dismiss } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast--${t.type}`} role="status">
          <span className="toast__icon" aria-hidden="true">
            {t.type === 'success' ? '✅' : t.type === 'error' ? '⚠️' : 'ℹ️'}
          </span>
          <span className="toast__message">{t.message}</span>
          <button type="button" className="toast__close" onClick={() => dismiss(t.id)} aria-label="Dismiss">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
