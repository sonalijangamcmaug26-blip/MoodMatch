import axios from 'axios';

export const TOKEN_KEY = 'moodmatch_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 15000,
});

// Attach the JWT to every request when the user is logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the server says the token is invalid or expired, log the user out.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !isLoginCall && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('moodmatch:session-expired'));
    }
    return Promise.reject(error);
  }
);

// Turns any axios error into a message that is safe to show to the user.
export function getErrorMessage(error) {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
    return 'Cannot reach the server. Please check that the backend is running.';
  }
  return 'Something went wrong. Please try again.';
}

// Field-level errors from the API: { fieldName: 'message' }
export const getFieldErrors = (error) => error.response?.data?.errors || {};

export default api;
