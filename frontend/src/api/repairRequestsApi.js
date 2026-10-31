import { USE_MOCK } from '../config';
import { http } from './http';
import * as mock from './mockServer';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const viaMock = (fn) => async (...args) => {
  await sleep(120); // simulate network latency
  return fn(...args);
};

// REST client for the endpoints in the design doc (§5.1). Switches to the in-browser mock when enabled.
const realApi = {
  list: (params) => http('/repair-requests', { params }),
  get: (id) => http(`/repair-requests/${id}`),
  history: (id) => http(`/repair-requests/${id}/history`),
  create: (payload) => http('/repair-requests', { method: 'POST', body: payload }),
  cancel: (id) => http(`/repair-requests/${id}/cancel`, { method: 'POST' }),
  health: () => http('/health'),
};

const mockApi = {
  list: viaMock(mock.listRequests),
  get: viaMock(mock.getRequest),
  history: viaMock(mock.getHistory),
  create: viaMock(mock.createRequest),
  cancel: viaMock(mock.cancelRequest),
  health: viaMock(() => ({ status: 'UP', mode: 'mock' })),
};

export const repairRequestsApi = USE_MOCK ? mockApi : realApi;

// Only available in demo mode – submits several requests at once.
export const seedDemoRequests = USE_MOCK ? mock.seedBurst : null;
