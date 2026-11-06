import { Link, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert';
import CoverArt from '../components/CoverArt';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import MoodCard from '../components/MoodCard';
import { useAuth } from '../context/AuthContext';
import useFetch from '../hooks/useFetch';
import { fetchFavourites } from '../services/favouriteService';
import { fetchHistory } from '../services/historyService';
import { fetchMoods } from '../services/moodService';
import { formatDateTime } from './MoodHistory';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const dashboard = useFetch(async () => {
    const [moods, history, favourites] = await Promise.all([
      fetchMoods(),
      fetchHistory(5),
      fetchFavourites(),
    ]);
    return { moods, history, favourites };
  }, []);

  if (dashboard.loading) return <Loader label="Loading your dashboard..." />;
  if (dashboard.error) {
    return (
      <div className="container section">
        <Alert type="error" onRetry={dashboard.reload}>{dashboard.error}</Alert>
      </div>
    );
  }

  const { moods, history, favourites } = dashboard.data;
  const favouriteItems = [
    ...favourites.books.map((book) => ({ key: `b${book.favourite_id}`, type: 'book', title: book.title, by: book.author, image: book.cover_image, to: `/books/${book.book_id}` })),
    ...favourites.movies.map((movie) => ({ key: `m${movie.favourite_id}`, type: 'movie', title: movie.title, by: movie.director, image: movie.poster_image, to: `/movies/${movie.movie_id}` })),
  ].slice(0, 6);

  return (
    <section className="section">
      <div className="container">
        <header className="dashboard-welcome">
          <div>
            <p className="eyebrow">Dashboard</p>
            <h1>Welcome back, {user.full_name.split(' ')[0]} 👋</h1>
            <p className="muted">How are you feeling today?</p>
          </div>
          <Link to="/moods" className="btn btn--primary btn--large">Discover Recommendations</Link>
        </header>

        <h2 className="subheading">Pick a mood</h2>
        <div className="mood-grid mood-grid--compact">
          {moods.map((mood) => (
            <MoodCard
              key={mood.mood_id}
              mood={mood}
              onSelect={(moodId) => navigate('/moods', { state: { moodId } })}
            />
          ))}
        </div>

        <div className="dashboard-columns">
          <div className="panel">
            <div className="panel__header">
              <h2>Recent moods</h2>
              <Link to="/history">See all</Link>
            </div>
            {history.length === 0 ? (
              <EmptyState icon="🕰️" title="No moods yet" message="Pick a mood to start your history." />
            ) : (
              <ul className="history-list history-list--compact">
                {history.map((entry) => (
                  <li className="history-item" key={entry.history_id}>
                    <span className="history-item__emoji" aria-hidden="true">{entry.emoji}</span>
                    <div className="history-item__text">
                      <strong>{entry.mood_name}</strong>
                      <time dateTime={entry.selected_at}>{formatDateTime(entry.selected_at)}</time>
                    </div>
                    <Link to={`/recommendations/${entry.mood_id}`} className="btn btn--ghost btn--small">View</Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="panel">
            <div className="panel__header">
              <h2>Your favourites</h2>
              <Link to="/favourites">See all</Link>
            </div>
            {favouriteItems.length === 0 ? (
              <EmptyState icon="💜" title="No favourites yet" message="Save books and movies you like." />
            ) : (
              <ul className="mini-list">
                {favouriteItems.map((item) => (
                  <li key={item.key}>
                    <Link to={item.to} className="mini-item">
                      <CoverArt className="mini-item__cover" src={item.image} title={item.title} type={item.type} />
                      <span className="mini-item__text">
                        <strong>{item.title}</strong>
                        <small>{item.type === 'book' ? '📖' : '🎬'} {item.by}</small>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
