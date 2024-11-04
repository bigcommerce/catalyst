'use client';

import { useActionState, useEffect } from 'react';
import { useFormState } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';

import { Action } from './remove-button';

export function CheckoutButton({
  action,
  label = 'Checkout',
}: {
  action: Action<{ error: string | null }, unknown>;
  label?: string;
}) {
  const [{ error }, formAction, isPending] = useFormState(action, { error: null });

  useEffect(() => {
    if (error) console.error(error);
  }, [error]);

  return (
    <form action={formAction}>
      <Button className="mt-10 w-full" disabled={isPending} loading={isPending} type="submit">
        {label}
      </Button>
    </form>
  );
}
