import { Link, useParams, useSearchParams } from 'react-router-dom';
import Alert from '../components/Alert';
import ContentCard from '../components/ContentCard';
import EmptyState from '../components/EmptyState';
import Loader from '../components/Loader';
import useFavourites from '../hooks/useFavourites';
import useFetch from '../hooks/useFetch';
import { fetchRecommendations } from '../services/moodService';

export default function Recommendations() {
  const { moodId } = useParams();
  const [searchParams] = useSearchParams();
  const requestedType = searchParams.get('type');
  const validType = requestedType === 'book' || requestedType === 'movie';
  const contentType = validType ? requestedType : 'book';
  const { data, loading, error, reload } = useFetch(
    () => fetchRecommendations(Number(moodId), contentType),
    [moodId, contentType]
  );
  const favourites = useFavourites();

  if (!validType || !Number.isInteger(Number(moodId)) || Number(moodId) <= 0) {
    return (
      <div className="container section">
        <Alert type="error">Invalid mood or content type. Please choose again.</Alert>
        <Link to="/moods" className="btn btn--primary">Choose Again</Link>
      </div>
    );
  }

  if (loading) return <Loader label="Finding your match..." />;
  if (error) {
    return (
      <div className="container section">
        <Alert type="error" onRetry={reload}>{error}</Alert>
        <Link to="/moods" className="btn btn--primary">Choose Another Mood</Link>
      </div>
    );
  }
  if (!data) return null;

  const { mood, genres, books, movies } = data;
  const isBook = contentType === 'book';
  const items = isBook ? books : movies;

  return (
    <section className="section">
      <div className="container">
        <header className="results-header">
          <span className="results-header__emoji" aria-hidden="true">{mood.emoji}</span>
          <div>
            <p className="eyebrow">Your mood · {isBook ? 'Book recommendations' : 'Movie recommendations'}</p>
            <h1>Feeling {mood.mood_name.toLowerCase()}? Here is your match.</h1>
            <div className="chips" aria-label="Genres matched to this mood">
              {genres.map((genre) => <span className="chip" key={genre.genre_id} title={genre.reason}>{genre.genre_name}</span>)}
            </div>
          </div>
          <Link to="/moods" className="btn btn--ghost">Change Mood</Link>
        </header>

        <div className="results-type-actions">
          <Link to={`/recommendations/${moodId}?type=book`} className={`btn ${isBook ? 'btn--primary' : 'btn--ghost'}`}>📚 Books</Link>
          <Link to={`/recommendations/${moodId}?type=movie`} className={`btn ${!isBook ? 'btn--primary' : 'btn--ghost'}`}>🎬 Movies</Link>
        </div>

        <Alert type="error">{favourites.error}</Alert>
        <h2 className="subheading">{isBook ? '📖 Book recommendations' : '🎬 Movie recommendations'}</h2>
        {items.length === 0 ? (
          <EmptyState title={`No ${isBook ? 'books' : 'movies'} found`} message={`We do not have ${isBook ? 'books' : 'movies'} for this mood yet.`} />
        ) : (
          <div className="card-grid">
            {items.map((item) => {
              const id = isBook ? item.book_id : item.movie_id;
              return (
                <ContentCard
                  key={id}
                  type={contentType}
                  item={item}
                  showReason
                  isFavourite={favourites.isFavourite(contentType, id)}
                  onToggleFavourite={favourites.toggleFavourite}
                />
              );
            })}
          </div>
        )}

        <div className="results-footer">
          <Link to="/moods" className="btn btn--primary btn--large">Choose Another Mood</Link>
        </div>
      </div>
    </section>
  );
}
