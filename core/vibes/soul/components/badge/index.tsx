import { clsx } from 'clsx';
import { ReactNode } from 'react';

export interface BadgeProps {
  children: ReactNode;
  className?: string;
}

export const Badge = function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'z-10 rounded-full bg-primary-highlight px-2 py-0.5 font-mono text-xs uppercase tracking-tighter text-foreground',
        className,
      )}
    >
      {children}
    </span>
  );
};
