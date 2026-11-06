import { Link } from 'react-router-dom';
import Alert from '../components/Alert';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import SectionHeading from '../components/SectionHeading';
import useFetch from '../hooks/useFetch';
import { fetchHistory } from '../services/historyService';

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

export default function MoodHistory() {
  const { data: history, loading, error, reload } = useFetch(() => fetchHistory(50), []);

  if (loading) return <Loader label="Loading your history..." />;
  if (error) {
    return (
      <div className="container section">
        <Alert type="error" onRetry={reload}>{error}</Alert>
      </div>
    );
  }

  return (
    <section className="section">
      <div className="container container--narrow">
        <SectionHeading eyebrow="Your journey" title="Mood history" subtitle="Every mood you have picked, newest first." />

        {history.length === 0 ? (
          <EmptyState
            icon="🕰️"
            title="No moods selected yet"
            message="Your selections will appear here."
            actionLabel="Discover Your Mood"
            actionTo="/moods"
          />
        ) : (
          <ul className="history-list">
            {history.map((entry) => (
              <li className="history-item" key={entry.history_id}>
                <span className="history-item__emoji" aria-hidden="true">{entry.emoji}</span>
                <div className="history-item__text">
                  <strong>{entry.mood_name}</strong>
                  <time dateTime={entry.selected_at}>{formatDateTime(entry.selected_at)}</time>
                </div>
                <Link to={`/recommendations/${entry.mood_id}`} className="btn btn--ghost btn--small">
                  View recommendations
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
