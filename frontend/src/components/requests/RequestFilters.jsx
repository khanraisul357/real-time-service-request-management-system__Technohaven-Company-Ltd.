import { STATUS_LIST, STATUS_META } from '../../utils/constants';
import { hasFilters } from '../../utils/filters';
import Icon from '../common/Icon';

export default function RequestFilters({ filters, onChange, onClear, searching }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="filters card">
      <label className="field field-search">
        <span className="sr-only">Search requests</span>
        <Icon name="search" size={16} className="field-icon" />
        <input
          type="search"
          placeholder="Search by request ID, code or device…"
          value={filters.search}
          onChange={set('search')}
        />
        {searching && <span className="spinner spinner-sm" aria-label="Searching" />}
      </label>

      <label className="field">
        <span className="field-label">Status</span>
        <select value={filters.status} onChange={set('status')}>
          <option value="">All statuses</option>
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span className="field-label">From</span>
        <input type="date" value={filters.from} max={filters.to || undefined} onChange={set('from')} />
      </label>

      <label className="field">
        <span className="field-label">To</span>
        <input type="date" value={filters.to} min={filters.from || undefined} onChange={set('to')} />
      </label>

      <button className="btn btn-ghost" onClick={onClear} disabled={!hasFilters(filters)}>
        Clear
      </button>
    </div>
  );
}
