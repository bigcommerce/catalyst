import React from 'react';

export const ChevronDownIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m5.29289 8.29289c.39053-.39052 1.02369-.39052 1.41422 0l5.29289 5.29291 5.2929-5.29291c.3905-.39052 1.0237-.39052 1.4142 0 .3905.39053.3905 1.02369 0 1.41422l-6 5.99999c-.3905.3905-1.0237.3905-1.4142 0l-6.00001-5.99999c-.39052-.39053-.39052-1.02369 0-1.41422z" />
  </svg>
);
