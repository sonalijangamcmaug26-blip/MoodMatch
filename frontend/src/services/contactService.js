import api from './api';

export const sendContactMessage = (payload) => api.post('/contact', payload).then((res) => res.data);
