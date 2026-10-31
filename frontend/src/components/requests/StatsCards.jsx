import { STATUS_LIST, STATUS_META } from '../../utils/constants';

export default function StatsCards({ items, activeStatus, onSelect }) {
  const counts = STATUS_LIST.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  items.forEach((i) => {
    if (counts[i.status] !== undefined) counts[i.status] += 1;
  });

  return (
    <div className="stats">
      <button className={`stat stat-total ${!activeStatus ? 'selected' : ''}`} onClick={() => onSelect('')}>
        <span className="stat-value">{items.length}</span>
        <span className="stat-label">All requests</span>
      </button>
      {STATUS_LIST.map((s) => (
        <button
          key={s}
          className={`stat stat-${s.toLowerCase()} ${activeStatus === s ? 'selected' : ''}`}
          onClick={() => onSelect(activeStatus === s ? '' : s)}
          title={STATUS_META[s].hint}
        >
          <span className="stat-value">{counts[s]}</span>
          <span className="stat-label">{STATUS_META[s].label}</span>
        </button>
      ))}
    </div>
  );
}
