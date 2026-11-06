import api from './api';

export const fetchHistory = (limit) =>
  api.get('/history', { params: { limit } }).then((res) => res.data.data.history);

export const saveMoodSelection = (moodId) => api.post('/history', { moodId });
