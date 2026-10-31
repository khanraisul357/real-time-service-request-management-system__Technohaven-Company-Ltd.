import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { WORKER_POOL_SIZE } from '../config';
import EmptyState from '../components/common/EmptyState';
import Icon from '../components/common/Icon';
import ProgressBar from '../components/common/ProgressBar';
import StatusBadge from '../components/common/StatusBadge';
import ActivityFeed from '../components/requests/ActivityFeed';
import CancelButton from '../components/requests/CancelButton';
import { useRequests } from '../context/RequestsContext';
import { ROLES, useRole } from '../context/RoleContext';
import useNow from '../hooks/useNow';
import { STALL_THRESHOLDS_MS } from '../utils/constants';
import { ageMs, timeAgo } from '../utils/format';

// A request that has been PENDING/PROCESSING without any update for a long time was probably
// interrupted (e.g. a restart) – the MVP flags it instead of resuming it (FR-12).
const isStalled = (r, now) => STALL_THRESHOLDS_MS[r.status] && ageMs(r.updatedAt, now) > STALL_THRESHOLDS_MS[r.status];

export default function SupervisorPage() {
  const { isSupervisor, setRole } = useRole();
  const { items, activity, connection } = useRequests();
  const now = useNow(10000);

  const { processing, pending, stalled, failed } = useMemo(
    () => ({
      processing: items.filter((r) => r.status === 'PROCESSING' && !isStalled(r, now)),
      pending: items.filter((r) => r.status === 'PENDING' && !isStalled(r, now)),
      stalled: items.filter((r) => isStalled(r, now)),
      failed: items.filter((r) => r.status === 'FAILED'),
    }),
    [items, now],
  );

  if (!isSupervisor) {
    return (
      <div className="page">
        <EmptyState
          icon="shield"
          title="Supervisor access only"
          message="The live monitor is part of the supervisor role. Switch role to continue."
          action={
            <button className="btn btn-primary" onClick={() => setRole(ROLES.SUPERVISOR)}>
              Switch to Supervisor
            </button>
          }
        />
      </div>
    );
  }

  const attention = [...stalled, ...failed].sort((a, b) => b.id - a.id).slice(0, 8);
  const slots = Array.from({ length: WORKER_POOL_SIZE }, (_, i) => processing[i] || null);
  const overflow = Math.max(0, processing.length - WORKER_POOL_SIZE);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Live monitor</h1>
          <p className="muted">Worker pool, queue and attention items – pushed to you in real time.</p>
        </div>
      </div>

      <div className="kpis">
        <div className="kpi">
          <span className="kpi-value">
            {Math.min(processing.length, WORKER_POOL_SIZE)}/{WORKER_POOL_SIZE}
          </span>
          <span className="kpi-label">Workers busy</span>
        </div>
        <div className="kpi">
          <span className="kpi-value">{pending.length}</span>
          <span className="kpi-label">Waiting in queue</span>
        </div>
        <div className="kpi kpi-danger">
          <span className="kpi-value">{failed.length}</span>
          <span className="kpi-label">Failed</span>
        </div>
        <div className="kpi kpi-warn">
          <span className="kpi-value">{stalled.length}</span>
          <span className="kpi-label">Possibly interrupted</span>
        </div>
      </div>

      <section className="card">
        <div className="section-head">
          <h2>Worker pool</h2>
          <span className="muted">{connection === 'CONNECTED' ? 'Receiving live events' : 'Waiting for connection…'}</span>
        </div>
        <div className="workers">
          {slots.map((r, i) => (
            <div key={i} className={`worker ${r ? 'busy' : 'idle'}`}>
              <div className="worker-head">
                <span>Worker {i + 1}</span>
                <span className="worker-state">{r ? 'Busy' : 'Idle'}</span>
              </div>
              {r ? (
                <>
                  <Link to={`/requests/${r.id}`} className="code">
                    {r.requestCode}
                  </Link>
                  <ProgressBar value={r.progress} status={r.status} />
                  <span className="muted worker-msg">{r.progressMessage}</span>
                </>
              ) : (
                <span className="muted">Waiting for the next task</span>
              )}
            </div>
          ))}
        </div>
        {overflow > 0 && <p className="muted">+{overflow} more processing</p>}
      </section>

      <div className="grid-2">
        <section className="card">
          <h2>Needs attention</h2>
          {attention.length === 0 ? (
            <p className="muted">Nothing needs attention right now.</p>
          ) : (
            <ul className="attention">
              {attention.map((r) => (
                <li key={r.id}>
                  <div>
                    <Link to={`/requests/${r.id}`} className="code">
                      {r.requestCode}
                    </Link>{' '}
                    <StatusBadge status={r.status} />
                    <span className="muted block">
                      {isStalled(r, now)
                        ? `No update for ${timeAgo(r.updatedAt, now).replace(' ago', '')} – possibly interrupted by a restart`
                        : r.errorMessage || 'Processing failed'}
                    </span>
                  </div>
                  <CancelButton request={r} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <div className="section-head">
            <h2>
              <Icon name="activity" size={18} /> Live activity
            </h2>
          </div>
          <ActivityFeed events={activity} />
        </section>
      </div>
    </div>
  );
}
