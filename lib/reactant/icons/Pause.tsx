import React from 'react';

export const PauseIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m13 4c0-.55228.4477-1 1-1h4c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1h-4c-.5523 0-1-.4477-1-1zm2 1v14h2v-14z" />
    <path d="m5 4c0-.55228.44772-1 1-1h4c.5523 0 1 .44772 1 1v16c0 .5523-.4477 1-1 1h-4c-.55228 0-1-.4477-1-1zm2 1v14h2v-14z" />
  </svg>
);
