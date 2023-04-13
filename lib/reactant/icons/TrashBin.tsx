import React from 'react';

export const TrashBinIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M2 6a1 1 0 0 1 1-1h18a1 1 0 1 1 0 2H3a1 1 0 0 1-1-1z" fillRule="evenodd" />
    <path
      d="M10 3a1 1 0 0 0-1 1v1h6V4a1 1 0 0 0-1-1h-4zm7 2V4a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v1H5a1 1 0 0 0-1 1v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V6a1 1 0 0 0-1-1h-2zM6 7v13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V7H6z"
      fillRule="evenodd"
    />
    <path
      d="M14 10a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1zm-4 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1z"
      fillRule="evenodd"
    />
  </svg>
);
