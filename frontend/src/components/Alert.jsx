// type: "error" | "success" | "info"
export default function Alert({ type = 'info', children, onRetry }) {
  if (!children) return null;
  return (
    <div className={`alert alert--${type}`} role={type === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onRetry && (
        <button type="button" className="btn btn--ghost btn--small" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  );
}
