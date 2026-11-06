import { Link } from 'react-router-dom';
import CoverArt from './CoverArt';
import Rating from './Rating';

// One card for both books and movies. `type` is "book" or "movie".
export default function ContentCard({
  type,
  item,
  isFavourite = false,
  onToggleFavourite,
  onRemove,
  showReason = false,
}) {
  const isBook = type === 'book';
  const id = isBook ? item.book_id : item.movie_id;
  const creator = isBook ? item.author : item.director;
  const image = isBook ? item.cover_image : item.poster_image;
  const year = isBook ? item.published_year : item.release_year;
  const detailsPath = `/${isBook ? 'books' : 'movies'}/${id}`;

  return (
    <article className="content-card">
      <Link to={detailsPath} className="content-card__media" aria-label={`View details for ${item.title}`}>
        <CoverArt src={image} title={item.title} type={type} />
        <span className="content-card__genre">{item.genre}</span>
      </Link>

      <div className="content-card__body">
        <h3 className="content-card__title">{item.title}</h3>
        <p className="content-card__creator">
          {isBook ? 'by' : 'directed by'} {creator}
        </p>
        <div className="content-card__meta">
          <Rating value={item.rating} max={isBook ? 5 : 10} />
          <span>{year}</span>
        </div>
        <p className="content-card__description">{item.description}</p>
        {showReason && item.reason && (
          <p className="content-card__reason">
            <strong>Why this?</strong> {item.reason}
          </p>
        )}

        <div className="content-card__actions">
          <Link to={detailsPath} className="btn btn--ghost btn--small">
            View Details
          </Link>
          {onToggleFavourite && (
            <button
              type="button"
              className={`btn btn--small ${isFavourite ? 'btn--pink-solid' : 'btn--pink'}`}
              onClick={() => onToggleFavourite(type, id)}
              aria-pressed={isFavourite}
            >
              {isFavourite ? '♥ Saved' : '♡ Add to Favourites'}
            </button>
          )}
          {onRemove && (
            <button type="button" className="btn btn--small btn--danger" onClick={() => onRemove(item.favourite_id)}>
              Remove
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
