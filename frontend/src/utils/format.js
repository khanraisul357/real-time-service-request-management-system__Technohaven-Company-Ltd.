const toDate = (iso) => (iso ? new Date(iso) : null);

export function formatDateTime(iso) {
  const d = toDate(iso);
  if (!d || Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatTime(iso) {
  const d = toDate(iso);
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function timeAgo(iso, now = Date.now()) {
  const d = toDate(iso);
  if (!d || Number.isNaN(d.getTime())) return '';
  const secs = Math.max(0, Math.round((now - d.getTime()) / 1000));
  if (secs < 5) return 'just now';
  if (secs < 60) return `${secs}s ago`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
  return `${Math.floor(secs / 86400)}d ago`;
}

export function formatDuration(startIso, endIso) {
  const s = toDate(startIso);
  const e = toDate(endIso);
  if (!s || !e) return '—';
  const secs = Math.max(0, Math.round((e - s) / 1000));
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  return `${m}m ${secs % 60}s`;
}

export function ageMs(iso, now = Date.now()) {
  const d = toDate(iso);
  return d ? now - d.getTime() : 0;
}
