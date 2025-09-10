# Simplified API Approach

## Overview
This documentation outlines the simplified API approach implemented in the Ramanayake Travels application. The goal is to reduce redundant API calls, remove console logs, and make the codebase more maintainable.

## API Utility Functions

The `apiUtils.js` file provides simple utility functions for making API calls:

```javascript
// Import in your component
import { apiGet, apiPost, apiPut, apiDelete } from '../utils/apiUtils';

// Example usage
const fetchData = async () => {
  try {
    // GET request
    const data = await apiGet('/reservations');
    
    // POST request with data
    const newItem = await apiPost('/reservations', { 
      vehicleId: '123', 
      pickupDate: '2023-01-01' 
    });
    
    // PUT request with data
    const updatedItem = await apiPut('/reservations/123/status', { 
      status: 'confirmed' 
    });
    
    // DELETE request
    await apiDelete('/reservations/123');
  } catch (error) {
    // Handle errors
    console.error('API error:', error.message);
  }
};
```

## Authentication

Authentication is handled automatically. The API utilities:

1. Get the JWT token from localStorage
2. Add the token to the Authorization header
3. Handle common error cases (401 Unauthorized, etc.)

## Benefits

1. **Simplified Code**: No need to manually add authentication headers to every request
2. **Consistent Error Handling**: Common errors are handled in one place
3. **Reduced API Calls**: API calls are more direct and explicit
4. **Better Maintainability**: Easier to update API endpoints or authentication logic

## Migrating from the Previous Approach

To migrate from the previous approach:

1. Replace imports from `api/axios` with imports from `utils/apiUtils`
2. Replace `api.get/post/put/delete` calls with `apiGet/apiPost/apiPut/apiDelete`
3. Remove any custom header configurations that were being passed

## Example

Before:
```javascript
import api from '../api/axios';

const fetchReservations = async () => {
  try {
    const response = await api.get('/reservations', {
      headers: getAuthHeaders()
    });
    setReservations(response.data);
  } catch (err) {
    setError('Failed to load reservations');
  }
};
```

After:
```javascript
import { apiGet } from '../utils/apiUtils';

const fetchReservations = async () => {
  try {
    const data = await apiGet('/reservations');
    setReservations(data);
  } catch (err) {
    setError('Failed to load reservations');
  }
};
```
