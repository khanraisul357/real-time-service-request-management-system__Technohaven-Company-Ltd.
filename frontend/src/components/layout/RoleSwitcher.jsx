import { ROLES, useRole } from '../../context/RoleContext';

export default function RoleSwitcher() {
  const { role, setRole } = useRole();
  return (
    <div className="segmented" role="group" aria-label="Switch role">
      {[ROLES.OPERATOR, ROLES.SUPERVISOR].map((r) => (
        <button
          key={r}
          className={role === r ? 'active' : ''}
          aria-pressed={role === r}
          onClick={() => setRole(r)}
        >
          {r === ROLES.OPERATOR ? 'Operator' : 'Supervisor'}
        </button>
      ))}
    </div>
  );
}
