export default function Logo({ compact = false }) {
  return (
    <span className="logo">
      <svg className="logo-mark" viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#19B082" />
        <path d="M36 10 18 36h12l-2 18 18-26H34z" fill="#fff" />
      </svg>
      {!compact && (
        <span className="logo-text">
          Technohaven<span>Servicing24</span>
        </span>
      )}
    </span>
  );
}
