export const EMPTY_FILTERS = { search: '', status: '', from: '', to: '' };

export const hasFilters = (f) => Boolean(f.search?.trim() || f.status || f.from || f.to);

// Same rules the backend applies for GET /api/repair-requests?status=&search=&from=&to=
// Used to keep the live list consistent when WebSocket events change a request.
export function matchesFilters(request, f) {
  if (f.status && request.status !== f.status) return false;

  const q = f.search?.trim().toLowerCase();
  if (q) {
    const haystack = [request.requestCode, String(request.id), request.deviceModel, request.deviceIdentifier]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    if (!haystack.includes(q)) return false;
  }

  const day = request.createdAt?.slice(0, 10);
  if (f.from && day < f.from) return false;
  if (f.to && day > f.to) return false;
  return true;
}
