import axios from 'axios';

// Cache to store pending requests
const pendingRequests = new Map();

// Create an axios instance with base URL and default config
const api = axios.create({
  baseURL: '/api', // Changed to use relative URL with Vite's proxy
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for authentication tokens and request deduplication
api.interceptors.request.use(
  (config) => {
    // You can add auth token from localStorage here if needed
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Generate a unique request ID based on method, url, and request data
    const method = config.method || 'unknown';
    const url = config.url || '';
    const requestId = `${method}:${url}:${JSON.stringify(config.data || {})}`;
    
    // Check if there's already a pending request with the same ID
    if (method && method.toLowerCase() === 'get' && !config.bypassDeduplication) {
      const existingRequest = pendingRequests.get(requestId);
      if (existingRequest) {
        // Return the same promise for duplicate GET requests
        return existingRequest;
      }
      
      // Create a new CancelToken source for this request
      const source = axios.CancelToken.source();
      config.cancelToken = source.token;
      
      // Create a new promise that will resolve when the request completes
      const promise = new Promise((resolve, reject) => {
        try {
          // Execute the original request
          axios(config)
            .then(response => {
              // Remove from pending requests when done
              pendingRequests.delete(requestId);
              resolve(response);
            })
            .catch(error => {
              // Remove from pending requests on error too
              pendingRequests.delete(requestId);
              reject(error);
            });
        } catch (error) {
          // Handle any synchronous errors in making the request
          pendingRequests.delete(requestId);
          reject(error);
        }
      });
      
      // Store the promise in our pending requests map
      pendingRequests.set(requestId, promise);
      
      // Return the promise
      return promise;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    try {
      // Don't reject if the request was cancelled due to deduplication
      if (axios.isCancel(error)) {
        return new Promise(() => {});
      }
      
      // Handle common errors here (e.g., unauthorized, server errors)
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        
        // Handle 401 Unauthorized errors - redirect to login or refresh token
        if (error.response.status === 401) {
          // Clear token if it's expired or invalid
          localStorage.removeItem('token');
          // You could dispatch a logout action or redirect to login
          window.location.href = '/login';
        }
        
        // Handle 403 Forbidden errors
        if (error.response.status === 403) {
          console.error('Access denied. You do not have permission to perform this action.');
        }
        
        // Handle 429 Too Many Requests
        if (error.response.status === 429) {
          console.error('Rate limit exceeded. Please try again later.');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network Error: The server is not responding. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Request Error:', error.message || 'Unknown error occurred');
      }
    } catch (interceptorError) {
      console.error('Error in axios interceptor:', interceptorError);
    }
    
    return Promise.reject(error);
  }
);

// Utility function to bypass deduplication for specific requests
api.bypassDeduplication = (config) => {
  return {
    ...config,
    bypassDeduplication: true
  };
};

export default api;