import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { seedDemoRequests } from '../api/repairRequestsApi';
import EmptyState from '../components/common/EmptyState';
import Icon from '../components/common/Icon';
import Spinner from '../components/common/Spinner';
import Pagination from '../components/requests/Pagination';
import RequestFilters from '../components/requests/RequestFilters';
import RequestTable from '../components/requests/RequestTable';
import StatsCards from '../components/requests/StatsCards';
import { useRequests } from '../context/RequestsContext';
import { useRole } from '../context/RoleContext';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import useNow from '../hooks/useNow';
import { EMPTY_FILTERS, hasFilters, matchesFilters } from '../utils/filters';
import { addMyId, getMyIds } from '../utils/myRequests';

const PAGE_SIZE = 8;

export default function DashboardPage() {
  const { items, loading, error, loadAll, loadFiltered } = useRequests();
  const { isSupervisor } = useRole();
  const toast = useToast();
  const pushToast = toast.push; // stable reference – keeps effects from re-running on every toast
  const now = useNow();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [scope, setScope] = useState(() => (getMyIds().length ? 'mine' : 'all'));
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);

  // Search text is debounced before it hits the API; other filters apply immediately.
  const debouncedSearch = useDebounce(filters.search, 350);
  const queryFilters = useMemo(
    () => ({ search: debouncedSearch, status: filters.status, from: filters.from, to: filters.to }),
    [debouncedSearch, filters.status, filters.from, filters.to],
  );

  // Server-side search & filter (FR-08). Results are merged into the live store.
  useEffect(() => {
    if (!hasFilters(queryFilters)) return undefined;
    let cancelled = false;
    setSearching(true);
    loadFiltered(queryFilters)
      .catch((e) => !cancelled && pushToast('error', e.message, 'Search failed'))
      .finally(() => !cancelled && setSearching(false));
    return () => {
      cancelled = true;
    };
  }, [queryFilters, loadFiltered, pushToast]);

  useEffect(() => setPage(1), [queryFilters, scope, isSupervisor]);

  const myIds = getMyIds();
  const scoped = useMemo(() => {
    if (isSupervisor || scope === 'all') return items;
    const mine = new Set(getMyIds());
    return items.filter((r) => mine.has(r.id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, isSupervisor, scope]);

  // The list always reflects the live store, filtered with the same rules as the API.
  const visible = useMemo(() => scoped.filter((r) => matchesFilters(r, queryFilters)), [scoped, queryFilters]);
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const runDemoBurst = () => {
    const created = seedDemoRequests(5);
    created.forEach((r) => addMyId(r.id));
    toast.push('info', `${created.length} requests submitted at once – watch the worker pool.`, 'Demo burst');
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Repair requests</h1>
          <p className="muted">
            {isSupervisor
              ? 'Every request across the organisation, updating live.'
              : 'Track your equipment repairs – statuses update automatically.'}
          </p>
        </div>
        <div className="page-actions">
          {seedDemoRequests && (
            <button className="btn btn-ghost" onClick={runDemoBurst} title="Submit 5 sample requests at once">
              <Icon name="zap" size={16} /> Simulate burst
            </button>
          )}
          <Link to="/requests/new" className="btn btn-primary">
            <Icon name="plus" size={16} /> New request
          </Link>
        </div>
      </div>

      {!isSupervisor && (
        <div className="chips" role="group" aria-label="Request scope">
          <button className={`chip ${scope === 'mine' ? 'active' : ''}`} onClick={() => setScope('mine')}>
            My requests ({myIds.length})
          </button>
          <button className={`chip ${scope === 'all' ? 'active' : ''}`} onClick={() => setScope('all')}>
            All requests
          </button>
        </div>
      )}

      <StatsCards items={scoped} activeStatus={filters.status} onSelect={(status) => setFilters((f) => ({ ...f, status }))} />

      <RequestFilters
        filters={filters}
        onChange={setFilters}
        onClear={() => setFilters(EMPTY_FILTERS)}
        searching={searching}
      />

      {loading && !items.length ? (
        <Spinner label="Loading requests…" />
      ) : error && !items.length ? (
        <EmptyState
          icon="alert"
          title="Could not load requests"
          message={error}
          action={
            <button className="btn btn-primary" onClick={() => loadAll()}>
              <Icon name="refresh" size={16} /> Try again
            </button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={hasFilters(queryFilters) ? 'search' : 'cpu'}
          title={hasFilters(queryFilters) ? 'No requests match your filters' : 'No repair requests yet'}
          message={
            hasFilters(queryFilters)
              ? 'Try a different search term, status or date range.'
              : 'Submit your first request and watch it move through the queue in real time.'
          }
          action={
            hasFilters(queryFilters) ? (
              <button className="btn btn-ghost" onClick={() => setFilters(EMPTY_FILTERS)}>
                Clear filters
              </button>
            ) : (
              <Link to="/requests/new" className="btn btn-primary">
                <Icon name="plus" size={16} /> Create a request
              </Link>
            )
          }
        />
      ) : (
        <>
          <RequestTable items={pageItems} now={now} />
          <Pagination page={page} pageCount={pageCount} total={visible.length} pageSize={PAGE_SIZE} onChange={setPage} />
        </>
      )}
    </div>
  );
}
