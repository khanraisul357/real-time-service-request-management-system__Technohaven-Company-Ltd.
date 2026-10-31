import { STATUS_META } from '../../utils/constants';
import { formatDateTime } from '../../utils/format';

export default function HistoryTimeline({ history }) {
  if (!history.length) return <p className="muted">No status changes recorded yet.</p>;
  return (
    <ol className="timeline">
      {history.map((h) => (
        <li key={h.id} className={`timeline-item tl-${String(h.newStatus).toLowerCase()}`}>
          <span className="timeline-dot" />
          <div>
            <strong>
              {h.oldStatus ? `${STATUS_META[h.oldStatus]?.label || h.oldStatus} → ` : ''}
              {STATUS_META[h.newStatus]?.label || h.newStatus}
            </strong>
            {h.message && <span className="block">{h.message}</span>}
            <span className="muted block">
              {formatDateTime(h.changedAt)}
              {h.actorType ? ` · ${h.actorType.toLowerCase()}` : ''}
            </span>
          </div>
        </li>
      ))}
    </ol>
  );
}
