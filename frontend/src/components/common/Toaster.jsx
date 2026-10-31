import { useToast } from '../../context/ToastContext';
import Icon from './Icon';

const ICONS = { success: 'check', error: 'alert', info: 'activity' };

export default function Toaster() {
  const { toasts, dismiss } = useToast();
  return (
    <div className="toaster" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <Icon name={ICONS[t.type] || 'activity'} size={18} />
          <div className="toast-body">
            {t.title && <strong>{t.title}</strong>}
            <span>{t.message}</span>
          </div>
          <button className="icon-btn" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
