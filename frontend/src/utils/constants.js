export const STATUS = Object.freeze({
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
});

export const STATUS_LIST = Object.values(STATUS);

export const STATUS_META = {
  PENDING: { label: 'Pending', hint: 'Waiting for a worker' },
  PROCESSING: { label: 'Processing', hint: 'Being repaired right now' },
  COMPLETED: { label: 'Completed', hint: 'Repair finished' },
  FAILED: { label: 'Failed', hint: 'Needs attention' },
  CANCELLED: { label: 'Cancelled', hint: 'Cancelled by a user' },
};

// Lifecycle rules (mirrors the backend state machine).
export const canCancel = (status) => status === STATUS.PENDING || status === STATUS.PROCESSING;
export const isActive = (status) => status === STATUS.PENDING || status === STATUS.PROCESSING;
export const isTerminal = (status) => !isActive(status);

export const CATEGORIES = [
  { value: 'LAPTOP', label: 'Laptop', icon: 'laptop', hint: 'Notebooks and ultrabooks' },
  { value: 'DESKTOP', label: 'Desktop', icon: 'desktop', hint: 'Desktop computers' },
  { value: 'SERVER', label: 'Server', icon: 'server', hint: 'Rack and tower servers' },
  { value: 'NETWORK_DEVICE', label: 'Network device', icon: 'wifi', hint: 'Routers, switches, firewalls' },
];

export const categoryMeta = (value) =>
  CATEGORIES.find((c) => c.value === value) || { value, label: value || 'Unknown', icon: 'cpu', hint: '' };

// Used when an event payload does not carry an explicit status.
export const STATUS_BY_EVENT = {
  REQUEST_CREATED: 'PENDING',
  REQUEST_COMPLETED: 'COMPLETED',
  REQUEST_FAILED: 'FAILED',
  REQUEST_CANCELLED: 'CANCELLED',
};

export const EVENT_META = {
  REQUEST_CREATED: { label: 'Created', icon: 'plus', tone: 'info' },
  STATUS_CHANGED: { label: 'Status changed', icon: 'refresh', tone: 'info' },
  PROGRESS_UPDATED: { label: 'Progress', icon: 'activity', tone: 'info' },
  REQUEST_COMPLETED: { label: 'Completed', icon: 'check', tone: 'success' },
  REQUEST_FAILED: { label: 'Failed', icon: 'alert', tone: 'danger' },
  REQUEST_CANCELLED: { label: 'Cancelled', icon: 'x', tone: 'muted' },
};

// A request that has not changed for this long is flagged as "possibly interrupted" (FR-12).
export const STALL_THRESHOLDS_MS = { PENDING: 3 * 60 * 1000, PROCESSING: 2 * 60 * 1000 };
