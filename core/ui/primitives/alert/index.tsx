import { clsx } from 'clsx';
import { X } from 'lucide-react';
import { ReactNode } from 'react';

import { Button } from '@/ui/primitives/button';

interface Props {
  variant: 'success' | 'warning' | 'error' | 'info';
  message: ReactNode;
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
        'border-foreground/10 ring-foreground flex max-w-[356px] min-w-[284px] items-center justify-between gap-2 rounded-xl border py-3 ps-4 pe-3 shadow-xs group-focus-visible:ring-2 group-focus-visible:outline-hidden',
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
        <span className="text-foreground text-sm font-normal">{message}</span>
        {Boolean(description) && (
          <span className="text-contrast-400 text-xs font-medium">{description}</span>
        )}
      </div>

      <div className="flex items-center gap-1">
        {action && (
          <Button onClick={action.onClick} size="x-small" variant="ghost">
            {action.label}
          </Button>
        )}

        <Button
          aria-label={dismissLabel}
          onClick={onDismiss}
          shape="circle"
          size="x-small"
          variant="ghost"
        >
          <X size={20} strokeWidth={1} />
        </Button>
      </div>
    </div>
  );
}
