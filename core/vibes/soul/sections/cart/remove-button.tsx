'use client';

import { clsx } from 'clsx';
import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

import { Spinner } from '@/vibes/soul/primitives/spinner';

export type Action<State, Payload> = (state: State, payload: Payload) => State | Promise<State>;

export function RemoveButton({
  id,
  action,
  removeItemAriaLabel,
  loadingAriaLabel,
}: {
  id: string;
  action: Action<{ error: string | null }, string>;
  removeItemAriaLabel?: string;
  loadingAriaLabel?: string;
}) {
  const [{ error }, formAction, isPending] = useFormState(action, { error: null });

  useEffect(() => {
    if (error != null) console.error(error);
  }, [error]);

  return (
    <form action={formAction.bind(null, id)}>
      <button
        aria-label={removeItemAriaLabel ?? 'Remove Item'}
        className={clsx(
          '-ml-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4',
          !isPending && 'hover:bg-contrast-100',
        )}
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <Spinner loadingAriaLabel={loadingAriaLabel} size="sm" />
        ) : (
          <Trash2 size={18} strokeWidth={1} />
        )}
      </button>
    </form>
  );
}
