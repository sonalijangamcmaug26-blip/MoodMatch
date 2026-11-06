import api from './api';

export const fetchMoods = () => api.get('/moods').then((res) => res.data.data.moods);

export const fetchRecommendations = (moodId, contentType) =>
  api.post('/moods/recommendations', { moodId, contentType }).then((res) => res.data.data);
