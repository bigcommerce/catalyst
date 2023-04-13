import React from 'react';

export const Check: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m18.7071 8.29289c.3905.39053.3905 1.02369 0 1.41422l-7 6.99999c-.3905.3905-1.0237.3905-1.4142 0l-4.00001-4c-.39052-.3905-.39052-1.0237 0-1.4142.39053-.3905 1.02369-.3905 1.41422 0l3.29289 3.2929 6.2929-6.29291c.3905-.39052 1.0237-.39052 1.4142 0z" />
  </svg>
);
