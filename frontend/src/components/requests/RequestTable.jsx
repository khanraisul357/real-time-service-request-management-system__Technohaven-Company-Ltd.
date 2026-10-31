import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryMeta, isActive } from '../../utils/constants';
import { formatDateTime, timeAgo } from '../../utils/format';
import ProgressBar from '../common/ProgressBar';
import StatusBadge from '../common/StatusBadge';
import CancelButton from './CancelButton';
import EquipmentIcon from './EquipmentIcon';

function RequestRow({ request, now }) {
  const navigate = useNavigate();
  const [flash, setFlash] = useState(false);
  const first = useRef(true);

  // Briefly highlight a row whenever a live event changes its status.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setFlash(true);
    const timer = setTimeout(() => setFlash(false), 1500);
    return () => clearTimeout(timer);
  }, [request.status]);

  return (
    <tr className={`row ${flash ? 'row-flash' : ''}`} onClick={() => navigate(`/requests/${request.id}`)}>
      <td data-label="Request">
        <Link to={`/requests/${request.id}`} className="code" onClick={(e) => e.stopPropagation()}>
          {request.requestCode}
        </Link>
      </td>
      <td data-label="Equipment">
        <div className="equip-cell">
          <EquipmentIcon category={request.equipmentCategory} />
          <div>
            <strong>{categoryMeta(request.equipmentCategory).label}</strong>
            <span className="muted block">{request.deviceModel}</span>
          </div>
        </div>
      </td>
      <td data-label="Issue" className="issue-cell">
        <span title={request.issueDescription}>{request.issueDescription}</span>
      </td>
      <td data-label="Submitted">
        {formatDateTime(request.createdAt)}
        <span className="muted block">{timeAgo(request.createdAt, now)}</span>
      </td>
      <td data-label="Status">
        <StatusBadge status={request.status} />
        {isActive(request.status) && request.status === 'PROCESSING' && (
          <ProgressBar value={request.progress} status={request.status} />
        )}
      </td>
      <td data-label="Actions" className="actions-cell">
        <Link to={`/requests/${request.id}`} className="btn btn-ghost btn-sm" onClick={(e) => e.stopPropagation()}>
          View
        </Link>
        <CancelButton request={request} />
      </td>
    </tr>
  );
}

export default function RequestTable({ items, now }) {
  return (
    <div className="table-wrap card">
      <table className="req-table">
        <thead>
          <tr>
            <th>Request</th>
            <th>Equipment</th>
            <th>Reported issue</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((r) => (
            <RequestRow key={r.id} request={r} now={now} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
