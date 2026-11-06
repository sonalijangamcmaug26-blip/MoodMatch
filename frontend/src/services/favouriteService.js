import api from './api';

// Returns { books: [...], movies: [...] }
export const fetchFavourites = () => api.get('/favourites').then((res) => res.data.data);

export const addFavourite = (type, id) =>
  api
    .post('/favourites', type === 'book' ? { bookId: id } : { movieId: id })
    .then((res) => res.data.data);

export const removeFavourite = (favouriteId) => api.delete(`/favourites/${favouriteId}`);
