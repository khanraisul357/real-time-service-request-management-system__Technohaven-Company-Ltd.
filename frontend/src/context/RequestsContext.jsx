import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { repairRequestsApi } from '../api/repairRequestsApi';
import { createSocketClient } from '../api/socketClient';
import { STATUS_BY_EVENT } from '../utils/constants';
import { isMine } from '../utils/myRequests';
import { useRole } from './RoleContext';
import { useToast } from './ToastContext';

const RequestsContext = createContext(null);

const sortItems = (items) => [...items].sort((a, b) => b.id - a.id);

const initialState = { items: [], loading: true, error: null, connection: 'CONNECTING', activity: [] };

function reducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'SET_ALL':
      return { ...state, items: sortItems(action.items), loading: false, error: null };
    case 'ERROR':
      return { ...state, loading: false, error: action.error };
    case 'UPSERT_MANY': {
      const map = new Map(state.items.map((i) => [i.id, i]));
      action.items.forEach((i) => map.set(i.id, { ...map.get(i.id), ...i }));
      return { ...state, items: sortItems([...map.values()]) };
    }
    case 'PATCH':
      if (!state.items.some((i) => i.id === action.id)) return state;
      return { ...state, items: state.items.map((i) => (i.id === action.id ? { ...i, ...action.patch } : i)) };
    case 'CONNECTION':
      return { ...state, connection: action.connection };
    case 'ACTIVITY':
      return { ...state, activity: [action.event, ...state.activity].slice(0, 40) };
    default:
      return state;
  }
}

export function RequestsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { isSupervisor } = useRole();
  const toast = useToast();

  // Refs let the long-lived socket callbacks always see fresh values without reconnecting.
  const itemsRef = useRef([]);
  itemsRef.current = state.items;
  const errorRef = useRef(null);
  errorRef.current = state.error;
  const supervisorRef = useRef(isSupervisor);
  supervisorRef.current = isSupervisor;
  const toastRef = useRef(toast);
  toastRef.current = toast;
  const inflight = useRef(new Set());

  const loadAll = useCallback(async (silent = false) => {
    if (!silent) dispatch({ type: 'LOADING' });
    try {
      const items = await repairRequestsApi.list();
      dispatch({ type: 'SET_ALL', items });
    } catch (error) {
      dispatch({ type: 'ERROR', error: error.message });
    }
  }, []);

  // Server-side search/filter (FR-08); results are merged into the live store.
  const loadFiltered = useCallback(async (filters) => {
    const items = await repairRequestsApi.list(filters);
    dispatch({ type: 'UPSERT_MANY', items });
    return items;
  }, []);

  const upsert = useCallback((items) => dispatch({ type: 'UPSERT_MANY', items }), []);

  // Pull the authoritative copy of one request (REST) – used after events.
  const syncOne = useCallback(async (id) => {
    if (inflight.current.has(id)) return;
    inflight.current.add(id);
    try {
      const request = await repairRequestsApi.get(id);
      dispatch({ type: 'UPSERT_MANY', items: [request] });
    } catch {
      /* the next event or reconnect will resync */
    } finally {
      inflight.current.delete(id);
    }
  }, []);

  const handleEvent = useCallback(
    (evt) => {
      const id = evt?.requestId;
      if (id == null) return;
      dispatch({ type: 'ACTIVITY', event: { ...evt, receivedAt: Date.now() } });

      // 1) Apply the event immediately for an instant UI update.
      const status = evt.status || STATUS_BY_EVENT[evt.eventType];
      const patch = { updatedAt: evt.timestamp };
      if (status) patch.status = status;
      if (evt.message) patch.progressMessage = evt.message;
      if (evt.progress != null) patch.progress = evt.progress;
      if (evt.eventType === 'REQUEST_COMPLETED') {
        patch.progress = 100;
        if (evt.resultSummary) patch.resultSummary = evt.resultSummary;
      }
      if (evt.eventType === 'REQUEST_FAILED' && evt.message) patch.errorMessage = evt.message;

      const known = itemsRef.current.some((i) => i.id === id);
      if (known) dispatch({ type: 'PATCH', id, patch });

      // 2) Re-sync the full record when the event is not self-sufficient.
      if (!known || evt.eventType !== 'PROGRESS_UPDATED' || evt.progress == null) syncOne(id);

      // 3) Notify the user about meaningful changes (operators only for their own requests).
      if (!supervisorRef.current && !isMine(id)) return;
      const label = evt.requestCode || `#${id}`;
      const t = toastRef.current;
      if (evt.eventType === 'REQUEST_COMPLETED') t.push('success', `${label} was completed.`, 'Repair completed');
      else if (evt.eventType === 'REQUEST_FAILED') t.push('error', `${label}: ${evt.message || 'processing failed.'}`, 'Repair failed');
      else if (evt.eventType === 'REQUEST_CANCELLED') t.push('info', `${label} was cancelled.`, 'Request cancelled');
      else if (evt.eventType === 'REQUEST_CREATED' && supervisorRef.current && !isMine(id)) t.push('info', `${label} was submitted.`, 'New request');
    },
    [syncOne],
  );

  // Initial load via REST, then keep everything live over the WebSocket.
  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handlersRef = useRef({});
  handlersRef.current = { handleEvent, loadAll };

  useEffect(() => {
    let wasConnected = false;
    const client = createSocketClient({
      onEvent: (evt) => handlersRef.current.handleEvent(evt),
      onConnectionChange: (connection) => {
        dispatch({ type: 'CONNECTION', connection });
        if (connection === 'CONNECTED') {
          // Recover anything missed while disconnected (design doc §6.5 step 7).
          if (wasConnected || errorRef.current) handlersRef.current.loadAll(true);
          wasConnected = true;
        }
      },
    });
    client.activate();
    return () => client.deactivate();
  }, []);

  const byId = useMemo(() => new Map(state.items.map((i) => [i.id, i])), [state.items]);

  const value = useMemo(
    () => ({ ...state, byId, loadAll, loadFiltered, upsert, syncOne }),
    [state, byId, loadAll, loadFiltered, upsert, syncOne],
  );
  return <RequestsContext.Provider value={value}>{children}</RequestsContext.Provider>;
}

export function useRequests() {
  const ctx = useContext(RequestsContext);
  if (!ctx) throw new Error('useRequests must be used inside <RequestsProvider>');
  return ctx;
}
