import React from 'react';

export const ChevronUpIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m18.7071 15.7071c-.3905.3905-1.0237.3905-1.4142 0l-5.2929-5.2929-5.29289 5.2929c-.39053.3905-1.02369.3905-1.41422 0-.39052-.3905-.39052-1.0237 0-1.4142l6.00001-6.00001c.3905-.39052 1.0237-.39052 1.4142 0l6 6.00001c.3905.3905.3905 1.0237 0 1.4142z" />
  </svg>
);
