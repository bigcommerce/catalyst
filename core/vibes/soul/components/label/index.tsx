import { clsx } from 'clsx';
import { ReactNode } from 'react';

export interface LabelProps {
  className?: string;
  children: ReactNode;
}

export const Label = function Label({ className, children }: LabelProps) {
  return (
    <span className={clsx('font-mono text-xs uppercase text-contrast-500', className)}>
      {children}
    </span>
  );
};
