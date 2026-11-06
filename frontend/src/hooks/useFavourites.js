import { useCallback, useEffect, useState } from 'react';
import { getErrorMessage } from '../services/api';
import { addFavourite, fetchFavourites, removeFavourite } from '../services/favouriteService';

// Keeps the user's favourites in state and offers a toggle for heart buttons.
// favouriteIds maps "book:12" / "movie:7" -> favourite_id (so we can delete it).
export default function useFavourites() {
  const [favouriteIds, setFavouriteIds] = useState({});
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const { books, movies } = await fetchFavourites();
      const map = {};
      books.forEach((fav) => (map[`book:${fav.book_id}`] = fav.favourite_id));
      movies.forEach((fav) => (map[`movie:${fav.movie_id}`] = fav.favourite_id));
      setFavouriteIds(map);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavourite = (type, id) => `${type}:${id}` in favouriteIds;

  const toggleFavourite = async (type, id) => {
    setError('');
    const key = `${type}:${id}`;
    try {
      if (key in favouriteIds) {
        await removeFavourite(favouriteIds[key]);
      } else {
        await addFavourite(type, id);
      }
      await refresh();
    } catch (err) {
      // 409 means it was already saved (e.g. in another tab): just resync
      if (err.response?.status === 409) await refresh();
      else setError(getErrorMessage(err));
    }
  };

  return { isFavourite, toggleFavourite, error };
}
