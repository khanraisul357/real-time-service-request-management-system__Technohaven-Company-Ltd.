import { USE_MOCK } from '../../config';
import { useRequests } from '../../context/RequestsContext';

const LABELS = {
  CONNECTED: 'Live',
  CONNECTING: 'Connecting…',
  RECONNECTING: 'Reconnecting…',
  DISCONNECTED: 'Offline',
};

export default function ConnectionBadge() {
  const { connection } = useRequests();
  const title = USE_MOCK
    ? 'Demo mode: events come from the in-browser mock backend'
    : 'WebSocket (STOMP) connection to the server';
  return (
    <span className={`conn conn-${connection.toLowerCase()}`} title={title}>
      <span className="conn-dot" />
      {LABELS[connection]}
      {USE_MOCK && <em>demo</em>}
    </span>
  );
}
