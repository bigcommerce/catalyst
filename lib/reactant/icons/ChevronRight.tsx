import React from 'react';

export const ChevronRightIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m9.29289 18.7071c-.39052-.3905-.39052-1.0237 0-1.4142l5.29291-5.2929-5.29291-5.29289c-.39052-.39053-.39052-1.02369 0-1.41422.39053-.39052 1.02371-.39052 1.41421 0l6 6.00001c.3905.3905.3905 1.0237 0 1.4142l-6 6c-.3905.3905-1.02368.3905-1.41421 0z" />
  </svg>
);
