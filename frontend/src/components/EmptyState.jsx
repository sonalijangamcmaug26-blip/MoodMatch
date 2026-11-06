import { Link } from 'react-router-dom';

export default function EmptyState({ icon = '🌙', title, message, actionLabel, actionTo }) {
  return (
    <div className="empty-state">
      <span className="empty-state__icon" aria-hidden="true">{icon}</span>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn btn--primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
