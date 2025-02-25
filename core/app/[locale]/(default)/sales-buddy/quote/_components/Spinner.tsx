import React from 'react';

interface LoaderProps {
  size?: number;
  borderSize?: number;
  color?: string;
  backgroundColor?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = 30,
  borderSize = 5,
  color = '#000000',
  backgroundColor = '#f3f3f3',
}) => {
  return (
    <div
      className="loader"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        border: `${borderSize}px solid ${backgroundColor}`,
        borderTop: `${borderSize}px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 2s linear infinite',
        WebkitAnimation: 'spin 2s linear infinite',
      }}
    />
  );
};

export default Loader;
