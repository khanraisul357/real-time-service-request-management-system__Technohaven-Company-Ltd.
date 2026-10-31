import { useEffect, useState } from 'react';

// Re-renders on an interval so relative times ("12s ago") stay fresh. This is purely a clock tick,
// not data polling – all data changes arrive over the WebSocket.
export default function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);
  return now;
}
