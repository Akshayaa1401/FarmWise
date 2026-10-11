import axios from 'axios';

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/+$/, '');
const API_BASE_URL = `${API_ORIGIN}/api`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach JWT bearer token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmwise_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle unauthenticated 401 response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid session if unauthenticated
      if (localStorage.getItem('farmwise_token')) {
        localStorage.removeItem('farmwise_token');
        localStorage.removeItem('farmwise_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
