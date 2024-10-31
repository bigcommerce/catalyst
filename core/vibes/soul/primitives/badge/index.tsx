import { ReactNode } from 'react'

import { clsx } from 'clsx'

export interface BadgeProps {
  children: ReactNode
  variant?: 'pill' | 'rounded'
  className?: string
}

export const Badge = function Badge({ children, variant = 'rounded', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'bg-primary-highlight px-2 py-0.5 font-mono text-xs uppercase tracking-tighter text-foreground',
        {
          pill: 'rounded-full',
          rounded: 'rounded',
        }[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
