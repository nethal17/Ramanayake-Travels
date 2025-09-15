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
    
    console.log(`API ${method.toUpperCase()} request to ${endpoint}`, { 
      url: config.url,
      method: config.method,
      data: config.data,
      params: config.params
    });
    
    const response = await axios(config);
    console.log(`API ${method.toUpperCase()} response from ${endpoint}:`, response.data);
    
    // If the server doesn't return a success field, add it based on HTTP status
    if (response.data && response.data.success === undefined) {
      response.data.success = true;
    }
    
    return response.data;
  } catch (error) {
    // Log the error
    console.error(`API Error in ${method.toUpperCase()} ${endpoint}:`, error);
    
    // Handle specific error cases
    if (error.response) {
      console.error('Response error:', error.response.data);
      
      if (error.response.status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      
      // Return the error response with success: false
      return {
        success: false,
        message: error.response.data.message || 'An error occurred',
        error: error.response.data
      };
    } else if (error.request) {
      console.error('Request error - no response received:', error.request);
      return {
        success: false,
        message: 'No response received from server'
      };
    } else {
      console.error('Error setting up request:', error.message);
      return {
        success: false,
        message: error.message || 'Error setting up request'
      };
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
