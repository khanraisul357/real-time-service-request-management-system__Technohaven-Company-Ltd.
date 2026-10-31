import { Link } from 'react-router-dom';
import { EVENT_META } from '../../utils/constants';
import { formatTime } from '../../utils/format';
import EmptyState from '../common/EmptyState';
import Icon from '../common/Icon';

export default function ActivityFeed({ events }) {
  if (!events.length) {
    return (
      <EmptyState
        icon="activity"
        title="Waiting for live events"
        message="Events appear here the moment the server pushes them over the WebSocket."
      />
    );
  }
  return (
    <ul className="feed">
      {events.map((e, i) => {
        const meta = EVENT_META[e.eventType] || { label: e.eventType, icon: 'activity', tone: 'info' };
        return (
          <li key={`${e.receivedAt}-${e.requestId}-${e.eventType}-${i}`} className={`feed-item feed-${meta.tone}`}>
            <span className="feed-icon">
              <Icon name={meta.icon} size={14} />
            </span>
            <div className="feed-body">
              <span>
                <Link to={`/requests/${e.requestId}`} className="code">
                  {e.requestCode || `#${e.requestId}`}
                </Link>{' '}
                <strong>{meta.label}</strong>
              </span>
              {e.message && <span className="muted block">{e.message}</span>}
            </div>
            <time>{formatTime(e.timestamp)}</time>
          </li>
        );
      })}
    </ul>
  );
}
