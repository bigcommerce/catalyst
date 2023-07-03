import clsx from 'clsx';
import React from 'react';

interface Props {
  colorValue?: string;
}

export function ColorSwatch({ colorValue }: Props) {
  return <div className="aspect-square w-full" style={{ background: colorValue }} />;
}
