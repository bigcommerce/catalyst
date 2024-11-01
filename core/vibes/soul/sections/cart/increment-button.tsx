'use client';

import { clsx } from 'clsx';
import { Plus } from 'lucide-react';
import { useActionState, useEffect } from 'react';

import { Action } from './remove-button';

export function LineItemQuantityIncrementButton({
  id,
  quantity,
  action,
  ariaLabel,
}: {
  id: string;
  quantity: number;
  action: Action<{ error: string | null }, { id: string; quantity: number }>;
  ariaLabel?: string;
}) {
  const [{ error }, formAction, isPending] = useActionState(action, { error: null });

  useEffect(() => {
    if (error != null) console.error(error);
  });

  return (
    <form action={formAction.bind(null, { id, quantity: quantity + 1 })}>
      <button
        aria-label={ariaLabel ?? 'Increase Count'}
        className={clsx(
          'group rounded-r-lg p-3 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isPending ? 'opacity-50' : 'hover:bg-contrast-100/50',
        )}
        disabled={isPending}
        type="submit"
      >
        <Plus
          className={clsx(
            'text-contrast-300 transition-colors duration-300',
            isPending ? '' : 'group-hover:text-foreground',
          )}
          size={18}
          strokeWidth={1.5}
        />
      </button>
    </form>
  );
}
