import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { repairRequestsApi } from '../api/repairRequestsApi';
import EmptyState from '../components/common/EmptyState';
import Icon from '../components/common/Icon';
import ProgressBar from '../components/common/ProgressBar';
import Spinner from '../components/common/Spinner';
import StatusBadge from '../components/common/StatusBadge';
import CancelButton from '../components/requests/CancelButton';
import EquipmentIcon from '../components/requests/EquipmentIcon';
import HistoryTimeline from '../components/requests/HistoryTimeline';
import { useRequests } from '../context/RequestsContext';
import { categoryMeta, isActive } from '../utils/constants';
import { formatDateTime, formatDuration } from '../utils/format';

export default function RequestDetailsPage() {
  const { id } = useParams();
  const numericId = Number(id);
  const { byId, upsert } = useRequests();
  const [loadState, setLoadState] = useState('loading'); // loading | ready | notfound | error
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);

  // The live store is the source of truth, so WebSocket events update this page instantly.
  const request = Number.isNaN(numericId) ? undefined : byId.get(numericId);

  useEffect(() => {
    if (Number.isNaN(numericId)) {
      setLoadState('notfound');
      return undefined;
    }
    let cancelled = false;
    setLoadState('loading');
    repairRequestsApi
      .get(numericId)
      .then((r) => {
        if (cancelled) return;
        upsert([r]);
        setLoadState('ready');
      })
      .catch((e) => {
        if (cancelled) return;
        setErrorMessage(e.message);
        setLoadState(e.status === 404 ? 'notfound' : 'error');
      });
    return () => {
      cancelled = true;
    };
  }, [numericId, upsert]);

  // Status history is re-fetched whenever the status changes.
  useEffect(() => {
    if (Number.isNaN(numericId)) return undefined;
    let cancelled = false;
    repairRequestsApi
      .history(numericId)
      .then((h) => !cancelled && setHistory(h))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [numericId, request?.status]);

  if (!request) {
    if (loadState === 'loading') return <Spinner label="Loading request…" />;
    return (
      <div className="page">
        <EmptyState
          icon="alert"
          title={loadState === 'notfound' ? 'Request not found' : 'Could not load request'}
          message={loadState === 'notfound' ? `There is no repair request with ID “${id}”.` : errorMessage}
          action={
            <Link to="/" className="btn btn-primary">
              Back to dashboard
            </Link>
          }
        />
      </div>
    );
  }

  const active = isActive(request.status);
  const category = categoryMeta(request.equipmentCategory);

  return (
    <div className="page">
      <Link to="/" className="back-link">
        <Icon name="back" size={16} /> Back to dashboard
      </Link>

      <section className="card detail-hero">
        <div className="detail-hero-top">
          <div>
            <span className="eyebrow">Repair request</span>
            <h1>{request.requestCode}</h1>
            <p className="muted">Submitted {formatDateTime(request.createdAt)}</p>
          </div>
          <div className="detail-hero-side">
            <StatusBadge status={request.status} />
            {active && (
              <span className="live-pill">
                <span className="live-dot" /> Live
              </span>
            )}
            <CancelButton request={request} size="md" />
          </div>
        </div>

        <ProgressBar value={request.progress} status={request.status} large />
        <p className="progress-message">{request.progressMessage || '—'}</p>
      </section>

      {request.status === 'COMPLETED' && request.resultSummary && (
        <div className="alert alert-success">
          <Icon name="check" size={18} />
          <div>
            <strong>Result</strong>
            <span className="block">{request.resultSummary}</span>
          </div>
        </div>
      )}
      {request.status === 'FAILED' && (
        <div className="alert alert-danger">
          <Icon name="alert" size={18} />
          <div>
            <strong>Repair failed</strong>
            <span className="block">{request.errorMessage || 'The repair could not be completed.'}</span>
          </div>
        </div>
      )}
      {request.status === 'CANCELLED' && (
        <div className="alert alert-muted">
          <Icon name="x" size={18} />
          <div>
            <strong>Request cancelled</strong>
            <span className="block">No further processing will happen for this request.</span>
          </div>
        </div>
      )}

      <div className="grid-2">
        <section className="card">
          <h2>Equipment</h2>
          <div className="equip-detail">
            <EquipmentIcon category={request.equipmentCategory} size={26} />
            <div>
              <strong>{category.label}</strong>
              <span className="block">{request.deviceModel}</span>
              <span className="muted block">Asset tag / serial: {request.deviceIdentifier || 'not provided'}</span>
            </div>
          </div>
          <h2>Reported issue</h2>
          <p className="issue-text">{request.issueDescription}</p>
        </section>

        <section className="card">
          <h2>Timeline</h2>
          <dl className="facts">
            <div>
              <dt>Submitted</dt>
              <dd>{formatDateTime(request.createdAt)}</dd>
            </div>
            <div>
              <dt>Processing started</dt>
              <dd>{formatDateTime(request.processingStartedAt)}</dd>
            </div>
            <div>
              <dt>{active ? 'Finished' : `${request.status[0]}${request.status.slice(1).toLowerCase()}`}</dt>
              <dd>{formatDateTime(request.completedAt)}</dd>
            </div>
            <div>
              <dt>Processing time</dt>
              <dd>{formatDuration(request.processingStartedAt, request.completedAt)}</dd>
            </div>
            <div>
              <dt>Last update</dt>
              <dd>{formatDateTime(request.updatedAt)}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="card">
        <h2>Status history</h2>
        <HistoryTimeline history={history} />
      </section>
    </div>
  );
}
