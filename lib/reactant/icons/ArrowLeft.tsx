import React from 'react';

export const ArrowLeftIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m12.7071 5.29289c.3905.39053.3905 1.02369 0 1.41422l-5.29289 5.29289 5.29289 5.2929c.3905.3905.3905 1.0237 0 1.4142s-1.0237.3905-1.4142 0l-6.00001-6c-.39052-.3905-.39052-1.0237 0-1.4142l6.00001-6.00001c.3905-.39052 1.0237-.39052 1.4142 0z" />
    <path d="m20 12c0 .5523-.4477 1-1 1h-13c-.55229 0-1-.4477-1-1s.44771-1 1-1h13c.5523 0 1 .4477 1 1z" />
  </svg>
);
