import React from 'react';

interface Props {
  colorValue?: string;
}

export function ColorSwatch({ colorValue }: Props) {
  return (
    <button className="box-border aspect-square w-full border-2 border-gray-200 p-1 outline-none ring-4 ring-transparent hover:border-blue-primary focus:border-blue-primary focus:ring-blue-primary/20">
      <div className="h-full w-full" style={{ background: colorValue }} />
    </button>
  );
}
