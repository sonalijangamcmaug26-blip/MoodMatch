import { useState } from 'react';
import Alert from '../components/Alert';
import ContentCard from '../components/ContentCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import SectionHeading from '../components/SectionHeading';
import useFetch from '../hooks/useFetch';
import { getErrorMessage } from '../services/api';
import { fetchFavourites, removeFavourite } from '../services/favouriteService';

export default function Favourites() {
  const { data, loading, error, reload } = useFetch(fetchFavourites, []);
  const [actionError, setActionError] = useState('');

  const handleRemove = async (favouriteId) => {
    setActionError('');
    try {
      await removeFavourite(favouriteId);
      await reload();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  if (loading && !data) return <Loader label="Loading your favourites..." />;
  if (error) {
    return (
      <div className="container section">
        <Alert type="error" onRetry={reload}>{error}</Alert>
      </div>
    );
  }

  const { books, movies } = data;
  const isEmpty = books.length === 0 && movies.length === 0;

  return (
    <section className="section">
      <div className="container">
        <SectionHeading eyebrow="Saved" title="My favourites" subtitle="Books and movies you have saved." />
        <Alert type="error">{actionError}</Alert>

        {isEmpty ? (
          <EmptyState
            icon="💜"
            title="No favourites yet"
            message="Pick a mood, then tap the heart on anything you like."
            actionLabel="Discover Your Mood"
            actionTo="/moods"
          />
        ) : (
          <>
            <h2 className="subheading">📖 Favourite books ({books.length})</h2>
            {books.length === 0 ? (
              <p className="muted">No favourite books yet.</p>
            ) : (
              <div className="card-grid">
                {books.map((book) => (
                  <ContentCard key={book.favourite_id} type="book" item={book} onRemove={handleRemove} />
                ))}
              </div>
            )}

            <h2 className="subheading">🎬 Favourite movies ({movies.length})</h2>
            {movies.length === 0 ? (
              <p className="muted">No favourite movies yet.</p>
            ) : (
              <div className="card-grid">
                {movies.map((movie) => (
                  <ContentCard key={movie.favourite_id} type="movie" item={movie} onRemove={handleRemove} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
