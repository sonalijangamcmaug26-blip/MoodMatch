import api from './api';

export const fetchBooks = (params) => api.get('/books', { params }).then((res) => res.data.data.books);
export const fetchBook = (id) => api.get(`/books/${id}`).then((res) => res.data.data.book);

export const fetchMovies = (params) =>
  api.get('/movies', { params }).then((res) => res.data.data.movies);
export const fetchMovie = (id) => api.get(`/movies/${id}`).then((res) => res.data.data.movie);
