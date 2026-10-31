import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const RoleContext = createContext(null);
const KEY = 'tsv24.role';
export const ROLES = { OPERATOR: 'OPERATOR', SUPERVISOR: 'SUPERVISOR' };

// MVP: roles are represented in the UI and permitted actions (no authentication, per the analysis doc).
export function RoleProvider({ children }) {
  const [role, setRole] = useState(() => {
    try {
      return localStorage.getItem(KEY) === ROLES.SUPERVISOR ? ROLES.SUPERVISOR : ROLES.OPERATOR;
    } catch {
      return ROLES.OPERATOR;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, role);
    } catch {
      /* ignore */
    }
  }, [role]);

  const value = useMemo(() => ({ role, setRole, isSupervisor: role === ROLES.SUPERVISOR }), [role]);
  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside <RoleProvider>');
  return ctx;
}
