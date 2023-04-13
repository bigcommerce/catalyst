import React from 'react';

export const ArrowRightIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m11.2929 18.7071c-.3905-.3905-.3905-1.0237 0-1.4142l5.2929-5.2929-5.2929-5.29289c-.3905-.39053-.3905-1.02369 0-1.41422.3905-.39052 1.0237-.39052 1.4142 0l6 6.00001c.3905.3905.3905 1.0237 0 1.4142l-6 6c-.3905.3905-1.0237.3905-1.4142 0z" />
    <path d="m4 12c0-.5523.44772-1 1-1h13c.5523 0 1 .4477 1 1s-.4477 1-1 1h-13c-.55228 0-1-.4477-1-1z" />
  </svg>
);
