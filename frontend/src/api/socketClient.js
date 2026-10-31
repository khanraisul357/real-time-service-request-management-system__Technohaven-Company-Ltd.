import { Client } from '@stomp/stompjs';
import { USE_MOCK, WS_TOPIC, WS_URL } from '../config';
import * as mock from './mockServer';

/**
 * Creates the real-time connection.
 *  - Real mode: STOMP over WebSocket (endpoint /ws), subscribed to /topic/repair-requests,
 *    with automatic reconnection.
 *  - Mock mode: subscribes to the in-browser mock event stream (same event payloads).
 *
 * onConnectionChange receives: CONNECTING | CONNECTED | RECONNECTING | DISCONNECTED
 */
export function createSocketClient({ onEvent, onConnectionChange }) {
  if (USE_MOCK) {
    let unsubscribe = null;
    return {
      activate() {
        unsubscribe = mock.subscribe(onEvent);
        onConnectionChange('CONNECTED');
      },
      deactivate() {
        if (unsubscribe) unsubscribe();
        unsubscribe = null;
        onConnectionChange('DISCONNECTED');
      },
    };
  }

  const client = new Client({
    brokerURL: WS_URL,
    reconnectDelay: 3000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    onConnect: () => {
      client.subscribe(WS_TOPIC, (message) => {
        try {
          onEvent(JSON.parse(message.body));
        } catch (error) {
          console.error('[ws] could not parse event', error);
        }
      });
      onConnectionChange('CONNECTED');
    },
    onWebSocketClose: () => onConnectionChange('RECONNECTING'),
    onStompError: (frame) => console.error('[ws] STOMP error', frame.headers?.message),
  });

  return {
    activate() {
      onConnectionChange('CONNECTING');
      client.activate();
    },
    deactivate() {
      client.deactivate();
      onConnectionChange('DISCONNECTED');
    },
  };
}
