// Central runtime configuration (values come from Vite env variables).
const env = import.meta.env;

export const USE_MOCK = String(env.VITE_USE_MOCK ?? 'true') === 'true';
export const API_BASE = env.VITE_API_BASE_URL || '/api';

const wsProtocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
export const WS_URL = env.VITE_WS_URL || `${wsProtocol}://${window.location.host}/ws`;
export const WS_TOPIC = '/topic/repair-requests';

export const WORKER_POOL_SIZE = Number(env.VITE_WORKER_POOL_SIZE || 3);
