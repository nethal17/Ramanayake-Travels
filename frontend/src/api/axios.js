import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      if (axios.isCancel(error)) {
        return new Promise(() => {});
      }
      if (error.response) {
        if (error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
        if (error.response.status === 403) {
          console.error('Access denied. You do not have permission to perform this action.');
        }
        if (error.response.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
        }
      } else if (error.request) {
        console.error('Network Error: The server is not responding. Please check your connection.');
      } else {
        console.error('Request Error:', error.message || 'Unknown error occurred');
      }
    } catch (interceptorError) {
      console.error('Error in axios interceptor:', interceptorError);
    }
    return Promise.reject(error);
  }
);

export default api;