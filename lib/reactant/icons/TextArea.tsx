import React from 'react';

export const TextAreaIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m21.7071 7.29289c.3905.39053.3905 1.02369 0 1.41422l-12.99999 12.99999c-.39053.3905-1.02369.3905-1.41422 0-.39052-.3905-.39052-1.0237 0-1.4142l13.00001-13.00001c.3905-.39052 1.0237-.39052 1.4142 0z" />
    <path d="m22.7071 14.2929c.3905.3905.3905 1.0237 0 1.4142l-7 7c-.3905.3905-1.0237.3905-1.4142 0s-.3905-1.0237 0-1.4142l7-7c.3905-.3905 1.0237-.3905 1.4142 0z" />
  </svg>
);
