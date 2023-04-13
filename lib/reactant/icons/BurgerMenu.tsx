import React from 'react';

export const BurgerMenuIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m2 18c0-.5523.44772-1 1-1h18c.5523 0 1 .4477 1 1s-.4477 1-1 1h-18c-.55228 0-1-.4477-1-1z" />
    <path d="m2 12c0-.5523.44772-1 1-1h18c.5523 0 1 .4477 1 1s-.4477 1-1 1h-18c-.55228 0-1-.4477-1-1z" />
    <path d="m2 6c0-.55228.44772-1 1-1h18c.5523 0 1 .44772 1 1s-.4477 1-1 1h-18c-.55228 0-1-.44772-1-1z" />
  </svg>
);
