export default function ProgressBar({ value = 0, status, large = false, showLabel = true }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={`progress ${large ? 'progress-lg' : ''}`}>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
      >
        <div className={`progress-fill progress-${String(status).toLowerCase()}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <span className="progress-label">{pct}%</span>}
    </div>
  );
}
