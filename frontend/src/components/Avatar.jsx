import React from "react";

const DEFAULT_FALLBACK = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";

export const Avatar = ({ src, alt = "Avatar", fallbackSrc = DEFAULT_FALLBACK, className = "", imgProps = {} }) => {
  const [error, setError] = React.useState(false);
  const finalSrc = !error && src ? src : fallbackSrc;

  return (
    <img
      src={finalSrc}
      alt={alt}
      loading="lazy"
      onError={() => setError(true)}
      className={className}
      {...imgProps}
    />
  );
};
