import Lottie from 'lottie-react';
import animationData from '../assets/animate.json';

const LoadingSpinner = ({ 
  size = 'md', 
  message = 'Loading...', 
  fullScreen = false,
  className = "" 
}) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      width: 80,
      height: 80,
      textSize: 'text-sm'
    },
    md: {
      width: 120,
      height: 120,
      textSize: 'text-base'
    },
    lg: {
      width: 200,
      height: 200,
      textSize: 'text-lg'
    },
    xl: {
      width: 300,
      height: 300,
      textSize: 'text-xl'
    }
  };

  const config = sizeConfig[size] || sizeConfig.md;

  const lottieOptions = {
    animationData,
    loop: true,
    autoplay: true,
    style: {
      width: config.width,
      height: config.height,
    }
  };

  if (fullScreen) {
    return (
      <div className={`fixed inset-0 bg-gray-50 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 ${className}`}>
        <div className="text-center">
          <Lottie {...lottieOptions} />
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
      <Lottie {...lottieOptions} />
      {message && (
        <p className={`mt-4 text-gray-700 font-medium ${config.textSize}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
