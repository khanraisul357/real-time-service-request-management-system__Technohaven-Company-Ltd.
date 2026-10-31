// In-browser mock of the Spring Boot backend, used when VITE_USE_MOCK=true.
// It mirrors the real design: persisted requests (localStorage), a bounded queue, a fixed-size worker
// pool, validated state transitions, history records and STOMP-style events.
import { ApiError } from './http';
import { WORKER_POOL_SIZE } from '../config';

const KEY = 'tsv24.mock.db.v1';
const QUEUE_CAPACITY = 50;
const ALLOWED = { PENDING: ['PROCESSING', 'CANCELLED'], PROCESSING: ['COMPLETED', 'FAILED', 'CANCELLED'] };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const nowIso = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { seq: 0, historySeq: 0, requests: [], history: {} };
}

// NOTE: requests left PENDING/PROCESSING in storage were "interrupted by a restart" – like the real
// MVP, they are NOT resumed, and the UI flags them as possibly interrupted.
const db = load();
const listeners = new Set();
const queue = [];
let running = 0;

const save = () => {
  try {
    localStorage.setItem(KEY, JSON.stringify(db));
  } catch {
    /* ignore */
  }
};

const find = (idOrCode) =>
  db.requests.find((r) => String(r.id) === String(idOrCode) || r.requestCode === idOrCode);

function emit(event) {
  listeners.forEach((listener) => listener(event));
}

function addHistory(req, oldStatus, newStatus, message, actorType = 'SYSTEM') {
  db.historySeq += 1;
  (db.history[req.id] ||= []).push({
    id: db.historySeq,
    requestId: req.id,
    actorType,
    oldStatus,
    newStatus,
    message,
    changedAt: nowIso(),
  });
}

// Validated transition + event publication (after the "commit", i.e. after save()).
function transition(req, newStatus, patch, eventType, message, actorType = 'SYSTEM') {
  if (!ALLOWED[req.status]?.includes(newStatus)) return false;
  const previousStatus = req.status;
  Object.assign(req, patch, { status: newStatus, updatedAt: nowIso(), progressMessage: message });
  addHistory(req, previousStatus, newStatus, message, actorType);
  save();
  emit({
    eventType,
    requestId: req.id,
    requestCode: req.requestCode,
    previousStatus,
    status: newStatus,
    message,
    progress: req.progress,
    resultSummary: req.resultSummary,
    timestamp: req.updatedAt,
  });
  return true;
}

function progress(req, value, message) {
  req.progress = value;
  req.progressMessage = message;
  req.updatedAt = nowIso();
  save();
  emit({
    eventType: 'PROGRESS_UPDATED',
    requestId: req.id,
    requestCode: req.requestCode,
    status: req.status,
    message,
    progress: value,
    timestamp: req.updatedAt,
  });
}

const STEPS = [
  { progress: 15, message: 'Running hardware diagnostics…' },
  { progress: 35, message: 'Isolating the faulty component…' },
  { progress: 60, message: 'Repairing / replacing parts…' },
  { progress: 85, message: 'Stress-testing the device…' },
];
const RESULTS = {
  LAPTOP: 'Cooling assembly cleaned, thermal paste replaced, stress test passed.',
  DESKTOP: 'Faulty component replaced and system stability verified.',
  SERVER: 'Hardware fault resolved, RAID verified and services restored.',
  NETWORK_DEVICE: 'Firmware reflashed, configuration restored and connectivity verified.',
};
const FAILURES = [
  'Replacement part is not available in stock.',
  'Diagnostics detected unrecoverable board damage.',
  'Firmware flash failed with a checksum error.',
];

async function runWorker(id) {
  const req = find(id);
  // Cancelled (or otherwise changed) while waiting in the queue → never start.
  if (!req || req.status !== 'PENDING') return;

  transition(req, 'PROCESSING', { processingStartedAt: nowIso(), progress: 5 }, 'STATUS_CHANGED', 'Repair processing has started.');
  const failAt = Math.random() < 0.15 ? Math.floor(Math.random() * STEPS.length) : -1;

  for (let i = 0; i < STEPS.length; i += 1) {
    await sleep(1200 + Math.random() * 1800);
    if (req.status !== 'PROCESSING') return; // cancelled while running → stop at a safe point
    if (i === failAt) {
      const error = FAILURES[Math.floor(Math.random() * FAILURES.length)];
      transition(req, 'FAILED', { errorMessage: error, completedAt: nowIso() }, 'REQUEST_FAILED', error);
      return;
    }
    progress(req, STEPS[i].progress, STEPS[i].message);
  }

  await sleep(1200 + Math.random() * 1200);
  if (req.status !== 'PROCESSING') return;
  const summary = RESULTS[req.equipmentCategory] || 'Repair completed successfully.';
  transition(req, 'COMPLETED', { progress: 100, resultSummary: summary, completedAt: nowIso() }, 'REQUEST_COMPLETED', 'Repair completed successfully.');
}

function pump() {
  while (running < WORKER_POOL_SIZE && queue.length) {
    const id = queue.shift();
    running += 1;
    runWorker(id)
      .catch((e) => console.error('[mock worker]', e))
      .finally(() => {
        running -= 1;
        pump();
      });
  }
}

export function createRequest(body) {
  const problems = [];
  if (!['LAPTOP', 'DESKTOP', 'SERVER', 'NETWORK_DEVICE'].includes(body?.equipmentCategory)) problems.push('equipmentCategory is invalid');
  if (!body?.deviceModel?.trim()) problems.push('deviceModel is required');
  if (!body?.issueDescription?.trim() || body.issueDescription.trim().length < 10) problems.push('issueDescription must be at least 10 characters');
  if (problems.length) throw new ApiError(`Validation failed: ${problems.join('; ')}`, 400);
  if (queue.length >= QUEUE_CAPACITY) throw new ApiError('The processing queue is full. Please try again shortly.', 503);

  db.seq += 1;
  const ts = nowIso();
  const req = {
    id: db.seq,
    requestCode: `RR-${1000 + db.seq}`,
    equipmentCategory: body.equipmentCategory,
    deviceModel: body.deviceModel.trim(),
    deviceIdentifier: body.deviceIdentifier?.trim() || null,
    issueDescription: body.issueDescription.trim(),
    status: 'PENDING',
    progress: 0,
    progressMessage: 'Request created and awaiting processing.',
    resultSummary: null,
    errorMessage: null,
    createdAt: ts,
    updatedAt: ts,
    processingStartedAt: null,
    completedAt: null,
  };
  db.requests.push(req);
  addHistory(req, null, 'PENDING', 'Request created.');
  save();
  emit({
    eventType: 'REQUEST_CREATED',
    requestId: req.id,
    requestCode: req.requestCode,
    status: 'PENDING',
    message: 'Request created and awaiting processing.',
    progress: 0,
    timestamp: ts,
  });
  queue.push(req.id);
  pump();
  return { ...req };
}

export function listRequests(params = {}) {
  const q = params.search?.trim().toLowerCase();
  return db.requests
    .filter((r) => {
      if (params.status && r.status !== params.status) return false;
      if (q) {
        const hay = [r.requestCode, String(r.id), r.deviceModel, r.deviceIdentifier].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      const day = r.createdAt.slice(0, 10);
      if (params.from && day < params.from) return false;
      if (params.to && day > params.to) return false;
      return true;
    })
    .sort((a, b) => b.id - a.id)
    .map((r) => ({ ...r }));
}

export function getRequest(id) {
  const req = find(id);
  if (!req) throw new ApiError(`Repair request ${id} was not found.`, 404);
  return { ...req };
}

export function getHistory(id) {
  const req = find(id);
  if (!req) throw new ApiError(`Repair request ${id} was not found.`, 404);
  return [...(db.history[req.id] || [])];
}

export function cancelRequest(id) {
  const req = find(id);
  if (!req) throw new ApiError(`Repair request ${id} was not found.`, 404);
  const idx = queue.indexOf(req.id);
  if (idx !== -1) queue.splice(idx, 1);
  const ok = transition(req, 'CANCELLED', { completedAt: nowIso() }, 'REQUEST_CANCELLED', 'Request cancelled by a user.', 'USER');
  if (!ok) throw new ApiError(`A ${req.status} request cannot be cancelled.`, 400);
  return { ...req };
}

const SAMPLES = [
  { equipmentCategory: 'LAPTOP', deviceModel: 'Dell Latitude 5420', deviceIdentifier: 'DL-5420-01', issueDescription: 'Laptop overheats and shuts down after ten minutes.' },
  { equipmentCategory: 'SERVER', deviceModel: 'HPE ProLiant DL380', deviceIdentifier: 'SRV-DB-02', issueDescription: 'Disk array reports a degraded drive and the fan is very loud.' },
  { equipmentCategory: 'NETWORK_DEVICE', deviceModel: 'Cisco Catalyst 2960', deviceIdentifier: 'SW-FLOOR-3', issueDescription: 'Switch ports drop randomly and the uplink keeps flapping.' },
  { equipmentCategory: 'DESKTOP', deviceModel: 'Lenovo ThinkCentre M720', deviceIdentifier: 'PC-ACC-07', issueDescription: 'Desktop will not boot and beeps three times at power on.' },
  { equipmentCategory: 'LAPTOP', deviceModel: 'MacBook Pro 14"', deviceIdentifier: 'MBP-DES-11', issueDescription: 'Battery drains within an hour and the trackpad is unresponsive.' },
];

// Demo helper: submit several requests at once to visualise the worker pool and queue.
export function seedBurst(count = 5) {
  const created = [];
  for (let i = 0; i < count; i += 1) {
    try {
      created.push(createRequest(SAMPLES[i % SAMPLES.length]));
    } catch (e) {
      console.warn('[mock] burst stopped:', e.message);
      break;
    }
  }
  return created;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
