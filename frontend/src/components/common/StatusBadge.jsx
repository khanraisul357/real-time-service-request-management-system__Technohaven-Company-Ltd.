import { STATUS_META } from '../../utils/constants';

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, hint: '' };
  return (
    <span className={`badge badge-${String(status).toLowerCase()}`} title={meta.hint}>
      <span className="badge-dot" />
      {meta.label}
    </span>
  );
}
