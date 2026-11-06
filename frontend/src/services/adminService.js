
import api from './api';

export const fetchAdminGenres = () =>
  api.get('/admin/genres').then((res) => res.data.data.genres);

export const createAdminContent = (type, values) =>
  api.post(`/admin/${type === 'book' ? 'books' : 'movies'}`, values)
    .then((res) => res.data.data);

export const updateAdminContent = (type, id, values) =>
  api.put(`/admin/${type === 'book' ? 'books' : 'movies'}/${id}`, values)
    .then((res) => res.data.data);

export const deleteAdminContent = (type, id) =>
  api.delete(`/admin/${type === 'book' ? 'books' : 'movies'}/${id}`);

// Fetch a book cover or movie poster through the backend.
export const fetchAdminImage = (type, title, creator, year) =>
  api.post('/admin/fetch-image', {
    type,
    title,
    creator,
    year,
  }).then((res) => res.data.data);
