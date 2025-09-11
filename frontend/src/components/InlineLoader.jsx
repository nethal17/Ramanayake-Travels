import Lottie from 'lottie-react';
import animationData from '../assets/animate.json';

const InlineLoader = ({ size = 16, className = '' }) => {
  const lottieOptions = {
    animationData,
    loop: true,
    autoplay: true,
    style: {
      width: size,
      height: size,
    }
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <Lottie {...lottieOptions} />
    </div>
  );
};

export default InlineLoader;
