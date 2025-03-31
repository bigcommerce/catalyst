'use client';

import { SubmissionResult } from '@conform-to/react';
import { XIcon } from 'lucide-react';
import { useActionState, useEffect, useTransition } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

interface RemoveWishlistItemState {
  lastResult: SubmissionResult | null;
  errorMessage?: string;
}

export type RemoveWishlistItemAction = Action<RemoveWishlistItemState, FormData>;

interface Props {
  wishlistId: string;
  itemId: string;
  action: RemoveWishlistItemAction;
}

export const RemoveWishlistItemButton = ({ wishlistId, itemId, action }: Props) => {
  const [isPending, startTransition] = useTransition();
  const [state, formAction] = useActionState(action, {
    lastResult: null,
  });

  useEffect(() => {
    if (state.lastResult?.status === 'error' && Boolean(state.errorMessage)) {
      toast.error(state.errorMessage);
    }
  }, [state]);

  return (
    <form action={(formData) => startTransition(() => formAction(formData))}>
      <input name="wishlistId" type="hidden" value={wishlistId} />
      <input name="wishlistItemId" type="hidden" value={itemId} />
      <Button loading={isPending} shape="circle" size="x-small" type="submit" variant="tertiary">
        <XIcon size={20} />
      </Button>
    </form>
  );
};
