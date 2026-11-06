import { Link, useNavigate, useParams } from 'react-router-dom';
import Alert from '../components/Alert';
import CoverArt from '../components/CoverArt';
import Loader from '../components/Loader';
import Rating from '../components/Rating';
import useFavourites from '../hooks/useFavourites';
import useFetch from '../hooks/useFetch';
import { fetchBook, fetchMovie } from '../services/contentService';

// One details page for both routes: /books/:id and /movies/:id
export default function ItemDetails({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const isBook = type === 'book';
  const { data: item, loading, error, reload } = useFetch(
    () => (isBook ? fetchBook(id) : fetchMovie(id)),
    [type, id]
  );
  const favourites = useFavourites();

  if (loading) return <Loader label="Loading details..." />;
  if (error) {
    return (
      <div className="container section">
        <Alert type="error" onRetry={reload}>{error}</Alert>
        <button type="button" className="btn btn--ghost" onClick={() => navigate(-1)}>← Go back</button>
      </div>
    );
  }

  const itemId = isBook ? item.book_id : item.movie_id;
  const saved = favourites.isFavourite(type, itemId);

  return (
    <section className="section">
      <div className="container">
        <button type="button" className="btn btn--ghost btn--small back-button" onClick={() => navigate(-1)}>
          ← Back
        </button>

        <div className="details">
          <CoverArt
            className="details__cover"
            src={isBook ? item.cover_image : item.poster_image}
            title={item.title}
            type={type}
          />

          <div className="details__info">
            <span className="chip">{item.genre}</span>
            <h1>{item.title}</h1>
            <p className="details__creator">
              {isBook ? 'Written by' : 'Directed by'} <strong>{isBook ? item.author : item.director}</strong>
            </p>

            <dl className="details__facts">
              <div><dt>Rating</dt><dd><Rating value={item.rating} max={isBook ? 5 : 10} /></dd></div>
              <div><dt>{isBook ? 'Published' : 'Released'}</dt><dd>{isBook ? item.published_year : item.release_year}</dd></div>
              <div><dt>Type</dt><dd>{isBook ? 'Book' : 'Movie'}</dd></div>
            </dl>

            <p className="details__description">{item.description}</p>

            <Alert type="error">{favourites.error}</Alert>
            <div className="details__actions">
              <button
                type="button"
                className={`btn btn--large ${saved ? 'btn--pink-solid' : 'btn--primary'}`}
                onClick={() => favourites.toggleFavourite(type, itemId)}
                aria-pressed={saved}
              >
                {saved ? '♥ In your favourites (click to remove)' : '♡ Add to Favourites'}
              </button>
              <Link to="/favourites" className="btn btn--ghost btn--large">My Favourites</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
