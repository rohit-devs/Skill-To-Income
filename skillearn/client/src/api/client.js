import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('skillearn_user') || 'null');

  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('skillearn_user');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.msg ||
  error?.message ||
  fallback;

export default api;
