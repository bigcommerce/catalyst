import { clsx } from 'clsx';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  variant?: 'pill' | 'rounded';
  color?: 'primary' | 'accent' | 'warning' | 'danger' | 'success' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'rounded', className, color = 'primary' }: Props) {
  return (
    <span
      className={clsx(
        'bg-primary-highlight px-2 py-0.5 font-mono text-xs uppercase tracking-tighter text-foreground',
        {
          pill: 'rounded-full',
          rounded: 'rounded',
        }[variant],
        {
          primary: 'bg-primary-highlight',
          accent: 'bg-accent-highlight',
          warning: 'bg-warning-highlight',
          danger: 'bg-danger-highlight',
          success: 'bg-success-highlight',
          info: 'bg-info-highlight',
        }[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
