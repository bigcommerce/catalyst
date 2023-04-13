import React from 'react';

export const CalendarIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m5 5c-.55228 0-1 .44772-1 1v14c0 .5523.44772 1 1 1h14c.5523 0 1-.4477 1-1v-14c0-.55228-.4477-1-1-1zm-3 1c0-1.65685 1.34315-3 3-3h14c1.6569 0 3 1.34315 3 3v14c0 1.6569-1.3431 3-3 3h-14c-1.65685 0-3-1.3431-3-3z" />
    <path d="m2 10c0-.55228.44772-1 1-1h18c.5523 0 1 .44772 1 1 0 .5523-.4477 1-1 1h-18c-.55228 0-1-.4477-1-1z" />
    <path d="m16 1c.5523 0 1 .44772 1 1v4c0 .55228-.4477 1-1 1s-1-.44772-1-1v-4c0-.55228.4477-1 1-1z" />
    <path d="m8 1c.55228 0 1 .44772 1 1v4c0 .55228-.44772 1-1 1s-1-.44772-1-1v-4c0-.55228.44772-1 1-1z" />
  </svg>
);
