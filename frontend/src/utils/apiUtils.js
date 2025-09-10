import axios from 'axios';

// Simple function to make API calls with proper auth token
export const callApi = async (method, endpoint, data = null) => {
  try {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // Set common headers
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add auth token if available
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    // Set up request config
    const config = {
      method,
      url: `/api${endpoint}`,
      headers
    };
    
    // Add data for POST, PUT, PATCH requests
    if (data && ['post', 'put', 'patch'].includes(method.toLowerCase())) {
      config.data = data;
    }
    
    // For GET requests with query params
    if (data && method.toLowerCase() === 'get') {
      config.params = data;
    }
    
    const response = await axios(config);
    return response.data;
  } catch (error) {
    // Handle specific error cases
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Re-throw the error to be handled by the component
    throw error;
  }
};

// Convenience methods
export const apiGet = (endpoint, params = null) => callApi('get', endpoint, params);
export const apiPost = (endpoint, data) => callApi('post', endpoint, data);
export const apiPut = (endpoint, data) => callApi('put', endpoint, data);
export const apiDelete = (endpoint) => callApi('delete', endpoint);
