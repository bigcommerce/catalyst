'use client';

import { SubmissionResult, useForm } from '@conform-to/react';
import { ReactNode, useActionState, useEffect } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';

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
  isPreorder,
  preorderLabel,
  disabled,
}: Props) {
  const [{ lastResult, successMessage }, formAction, pending] = useActionState(addToCartAction, {
    lastResult: null,
    successMessage: undefined,
  });

  const [form] = useForm({ lastResult });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);
    }
  }, [lastResult, successMessage]);

  useEffect(() => {
    if (form.errors) {
      form.errors.forEach((error) => {
        toast.error(error);
      });
    }
  }, [form.errors]);

  return (
    <form action={formAction}>
      <input name="id" type="hidden" value={productId} />
      <Button className="w-full" disabled={disabled} loading={pending} size="medium" type="submit">
        {isPreorder ? preorderLabel : addToCartLabel}
      </Button>
    </form>
  );
}
