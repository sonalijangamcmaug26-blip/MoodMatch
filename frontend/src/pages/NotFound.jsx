import EmptyState from '../components/EmptyState';

export default function NotFound() {
  return (
    <div className="container section">
      <EmptyState
        icon="🧭"
        title="Page not found"
        message="The page you are looking for does not exist."
        actionLabel="Back to Home"
        actionTo="/"
      />
    </div>
  );
}
