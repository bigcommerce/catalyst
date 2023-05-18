import React from 'react';

interface Props {
  className?: string;
}

export function Test(props: Props) {
  return <p {...props}>Test, world!</p>;
}
