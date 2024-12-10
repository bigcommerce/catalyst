import { clsx } from 'clsx';
import { X } from 'lucide-react';

import { Button } from '@/vibes/soul/primitives/button';

interface Props {
  variant: 'success' | 'warning' | 'error' | 'info';
  message: string;
  description?: string;
  dismissLabel?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
}

export function Alert({
  variant,
  message,
  description,
  action,
  dismissLabel = 'Dismiss',
  onDismiss,
}: Props) {
  return (
    <div
      className={clsx(
        'flex min-w-[284px] max-w-[356px] items-center justify-between gap-2 rounded-xl border border-foreground/10 py-3 pe-3 ps-4 shadow-sm ring-foreground group-focus-visible:outline-none group-focus-visible:ring-2',
        {
          success: 'bg-success-highlight',
          warning: 'bg-warning-highlight',
          error: 'bg-error-highlight',
          info: 'bg-background',
        }[variant],
      )}
      role="alert"
    >
      <div className="flex flex-col">
        <span className="text-sm font-normal text-foreground">{message}</span>
        {Boolean(description) && (
          <span className="text-xs font-medium text-contrast-400">{description}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {action && (
          <Button onClick={action.onClick} size="x-small" variant="ghost">
            {action.label}
          </Button>
        )}

        <Button aria-label={dismissLabel} onClick={onDismiss} size="icon-small" variant="ghost">
          <X size={20} strokeWidth={1} />
        </Button>
      </div>
    </div>
  );
}
