import api from './api';

export const registerUser = (payload) =>
  api.post('/auth/register', payload).then((res) => res.data);

export const loginUser = (payload) => api.post('/auth/login', payload).then((res) => res.data.data);

export const fetchProfile = () => api.get('/auth/profile').then((res) => res.data.data.user);
