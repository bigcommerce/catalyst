'use client';

import { clsx } from 'clsx';
import { Minus } from 'lucide-react';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

import { Action } from './remove-button';

export function DecrementButton({
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
  const [{ error }, formAction, isPending] = useFormState(action, { error: null });

  useEffect(() => {
    if (error != null) console.error(error);
  });

  return (
    <form action={formAction.bind(null, { id, quantity: quantity - 1 })}>
      <button
        aria-label={ariaLabel ?? 'Decrease Count'}
        className={clsx(
          'group rounded-l-lg p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isPending || quantity === 1 ? 'opacity-50' : 'hover:bg-contrast-100/50',
        )}
        disabled={isPending || quantity === 1}
        type="submit"
      >
        <Minus
          className={clsx(
            'text-contrast-300 transition-colors duration-300',
            isPending || quantity === 1 ? '' : 'group-hover:text-foreground',
          )}
          size={18}
          strokeWidth={1.5}
        />
      </button>
    </form>
  );
}
