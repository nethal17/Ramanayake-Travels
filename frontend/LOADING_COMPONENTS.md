# Loading Components Guide

This guide documents the loading/spinner components available in the Ramanayake-Travels project and provides guidelines on how to use them consistently throughout the application.

## Available Loading Components

### 1. LoadingSpinner Component

The `LoadingSpinner` component is a reusable, configurable loading spinner that can be imported from `src/components/LoadingSpinner.jsx`.

#### Usage

```jsx
import LoadingSpinner from '../components/LoadingSpinner';

// In your component:
if (loading) {
  return <LoadingSpinner fullScreen={true} />;
}
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | string | 'md' | Size of the spinner. Options: 'sm', 'md', 'lg', 'xl' |
| `message` | string | 'Loading...' | Text displayed below the spinner |
| `fullScreen` | boolean | false | Whether to display as a fullscreen overlay |
| `className` | string | '' | Additional CSS classes |

#### Examples

```jsx
// Basic usage
<LoadingSpinner />

// Small spinner with custom message
<LoadingSpinner size="sm" message="Fetching data..." />

// Full-screen overlay
<LoadingSpinner fullScreen={true} />

// Large spinner with custom styling
<LoadingSpinner size="lg" className="my-8" />
```

### 2. Inline Spinner

For smaller UI elements like buttons, use the inline spinner created with Tailwind CSS.

#### Usage

```jsx
<button
  disabled={loading}
  className={`px-4 py-2 rounded ${
    loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
  } text-white flex items-center`}
>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Processing...
    </>
  ) : (
    'Submit'
  )}
</button>
```

## Guidelines for Use

### When to Use LoadingSpinner Component

- Page-level loading states
- Loading entire sections of content
- Initial data fetching
- When you need a consistent, configurable spinner

Example:
```jsx
if (loading) {
  return <LoadingSpinner fullScreen={true} />;
}
```

### When to Use Inline Spinner

- Inside buttons
- In smaller UI components
- When you need to show loading state without blocking the entire UI
- For actions that don't block the whole page

Example:
```jsx
<button disabled={loading}>
  {loading ? (
    <>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      Saving...
    </>
  ) : (
    'Save'
  )}
</button>
```

## Best Practices

1. **Consistency**: Use the same loading component for similar UI elements across the application.
2. **Feedback**: Always provide visual feedback when an operation is in progress.
3. **Disabling Interactions**: Disable interactive elements when in loading state to prevent multiple submissions.
4. **Appropriate Sizing**: Use the right size spinner for the context:
   - Buttons: Small inline spinner
   - Sections: Medium LoadingSpinner
   - Full page: LoadingSpinner with fullScreen=true
5. **Messaging**: Provide clear loading messages for operations that might take time.

## Example Implementation

```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoadingSpinner from '../components/LoadingSpinner';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('your-api-endpoint');
        setData(response.data);
      } catch (err) {
        setError('Failed to fetch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await axios.post('your-api-endpoint', data);
      // Handle success
    } catch (err) {
      setError('Failed to submit data');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen={true} message="Fetching data..." />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div>
      {/* Content */}
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className={`px-4 py-2 rounded text-white flex items-center ${
          submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Saving...
          </>
        ) : (
          'Save Changes'
        )}
      </button>
    </div>
  );
};

export default MyComponent;
```
