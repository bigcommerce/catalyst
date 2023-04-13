import React from 'react';

export const SearchIcon: React.FC<React.ComponentPropsWithoutRef<'svg'>> = ({ ...props }) => (
  <svg
    fill="currentColor"
    height="24"
    viewBox="0 0 24 24"
    width="24"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m11 4c-3.86599 0-7 3.13401-7 7 0 3.866 3.13401 7 7 7 3.866 0 7-3.134 7-7 0-3.86599-3.134-7-7-7zm-9 7c0-4.97056 4.02944-9 9-9 4.9706 0 9 4.02944 9 9 0 4.9706-4.0294 9-9 9-4.97056 0-9-4.0294-9-9z" />
    <path d="m15.9428 15.9428c.3905-.3905 1.0237-.3905 1.4142 0l4.35 4.35c.3905.3905.3905 1.0237 0 1.4142s-1.0237.3905-1.4142 0l-4.35-4.35c-.3905-.3905-.3905-1.0237 0-1.4142z" />
  </svg>
);
