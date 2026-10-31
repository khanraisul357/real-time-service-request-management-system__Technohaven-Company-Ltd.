import Icon from '../common/Icon';

export default function Pagination({ page, pageCount, total, pageSize, onChange }) {
  if (pageCount <= 1) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div className="pagination">
      <span>
        Showing {from}–{to} of {total}
      </span>
      <div>
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <Icon name="left" size={16} /> Prev
        </button>
        <span className="page-indicator">
          {page} / {pageCount}
        </span>
        <button className="btn btn-ghost btn-sm" disabled={page >= pageCount} onClick={() => onChange(page + 1)}>
          Next <Icon name="right" size={16} />
        </button>
      </div>
    </div>
  );
}
