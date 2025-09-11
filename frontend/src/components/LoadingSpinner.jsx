import React from 'react';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  className = "" 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      width: '2rem',
      height: '2rem',
      textSize: 'text-sm'
    },
    md: {
      width: '3rem',
      height: '3rem',
      textSize: 'text-base'
    },
    lg: {
      width: '5rem',
      height: '5rem',
      textSize: 'text-lg'
    },
    xl: {
      width: '7rem',
      height: '7rem',
      textSize: 'text-xl'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-gray-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        <div className="text-center">
          <div 
            className="inline-block animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
            style={{ width: config.width, height: config.height }}
            role="status"
          />
          {message && (
            <p className={`mt-4 text-gray-700 font-medium ${config.textSize}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div 
        className="inline-block animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
        style={{ width: config.width, height: config.height }}
        role="status"
      />
      {message && (
        <p className={`mt-4 text-gray-700 font-medium ${config.textSize}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
