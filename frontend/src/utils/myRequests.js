// Operators see "their" requests. With no authentication in the MVP, the browser remembers the IDs
// of the requests it submitted.
const KEY = 'tsv24.myRequestIds';

export function getMyIds() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function addMyId(id) {
  const ids = new Set(getMyIds());
  ids.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...ids]));
  } catch {
    /* storage unavailable – ignore */
  }
}

export const isMine = (id) => getMyIds().includes(id);
