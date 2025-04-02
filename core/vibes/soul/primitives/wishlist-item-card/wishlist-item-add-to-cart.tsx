'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { startTransition, useActionState, useEffect } from 'react';
import { requestFormReset, useFormStatus } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';

import { WishlistItem } from '.';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: React.ReactNode;
  errorMessage?: string;
}

export type AddWishlistItemToCartAction = Action<State, FormData>;

interface Props extends Omit<WishlistItem, 'itemId' | 'product'> {
  action: AddWishlistItemToCartAction;
}

export const WishlistItemAddToCart = ({
  callToAction = { label: 'Add to cart' },
  productId,
  variantId,
  action,
}: Props) => {
  const events = useEvents();
  const [{ lastResult, successMessage, errorMessage }, formAction] = useActionState(action, {
    lastResult: null,
  });

  const [form] = useForm({
    lastResult,
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(async () => {
        requestFormReset(event.currentTarget);

        const state = await action({ lastResult }, formData);

        if (state.lastResult?.status === 'success') {
          events.onAddToCart?.(formData);
        }
      });
    },
  });

  useEffect(() => {
    if (lastResult?.status === 'success' && successMessage) {
      toast.success(successMessage);
    }

    if (lastResult?.status === 'error' && errorMessage) {
      toast.error(errorMessage);
    }
  }, [lastResult, successMessage, errorMessage]);

  return (
    <form {...getFormProps(form)} action={formAction} className="flex">
      <input name="productId" type="hidden" value={productId} />
      <input name="variantId" type="hidden" value={variantId} />
      <SubmitButton ctaLabel={callToAction.label} disabled={callToAction.disabled} />
    </form>
  );
};

function SubmitButton({ ctaLabel, disabled }: { ctaLabel: string; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button className="flex-1" disabled={disabled} loading={pending} size="small" type="submit">
      {ctaLabel}
    </Button>
  );
}
