'use client';

import { getFormProps, SubmissionResult, useForm } from '@conform-to/react';
import { ReactNode, startTransition, useActionState, useEffect } from 'react';
import { requestFormReset } from 'react-dom';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';
import { useRouter } from '~/i18n/routing';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type CompareAddToCartAction = Action<State, FormData>;

interface Props {
  disabled?: boolean;
  productId: string;
  addToCartLabel: string;
  preorderLabel: string;
  isPreorder?: boolean;
  addToCartAction: CompareAddToCartAction;
}

export function AddToCartForm({
  productId,
  addToCartLabel,
  addToCartAction,
  isPreorder = false,
  preorderLabel,
  disabled = false,
}: Props) {
  const router = useRouter();
  const events = useEvents();

  const [{ lastResult, successMessage }, formAction, pending] = useActionState(addToCartAction, {
    lastResult: null,
    successMessage: undefined,
  });

  const [form] = useForm({
    lastResult,
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        requestFormReset(event.currentTarget);
        formAction(formData);

        events.onAddToCart?.(formData);
      });
    },
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);

      // This is needed to refresh the Data Cache after the product has been added to the cart.
      // The cart id is not picked up after the first time the cart is created/updated.
      router.refresh();
    }
  }, [lastResult, successMessage, router]);

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  return (
    <form {...getFormProps(form)} action={formAction}>
      <input name="id" type="hidden" value={productId} />
      <Button className="w-full" disabled={disabled} loading={pending} size="medium" type="submit">
        {isPreorder ? preorderLabel : addToCartLabel}
      </Button>
    </form>
  );
}
