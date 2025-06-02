'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { startTransition, useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { couponCodeActionFormDataSchema } from '../schema';

import { CouponChip } from './coupon-chip';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface CouponCodeFormState {
  couponCodes: string[];
  lastResult: SubmissionResult | null;
}

export interface CouponCodeFormProps {
  action: Action<CouponCodeFormState, FormData>;
  couponCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
  requiredErrorMessage?: string;
}

export function CouponCodeForm({
  action,
  couponCodes,
  ctaLabel = 'Apply',
  disabled = false,
  label = 'Promo code',
  placeholder,
  removeLabel,
  requiredErrorMessage,
}: CouponCodeFormProps) {
  const [state, formAction] = useActionState(action, {
    couponCodes: couponCodes ?? [],
    lastResult: null,
  });

  const [optimisticCouponCodes, setOptimisticCouponCodes] = useOptimistic<string[], FormData>(
    state.couponCodes,
    (prevState, formData) => {
      const submission = parseWithZod(formData, {
        schema: couponCodeActionFormDataSchema({ required_error: requiredErrorMessage }),
      });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'delete': {
          const couponCode = submission.value.couponCode;

          return prevState.filter((code) => code !== couponCode);
        }

        default:
          return prevState;
      }
    },
  );

  const [form, fields] = useForm({
    lastResult: state.lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: couponCodeActionFormDataSchema({ required_error: requiredErrorMessage }),
      });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setOptimisticCouponCodes(formData);
      });
    },
  });

  return (
    <div className="space-y-2 border-t border-[var(--cart-border,hsl(var(--contrast-100)))] pb-5 pt-4">
      <form {...getFormProps(form)} action={formAction} className="space-y-2">
        <label htmlFor={fields.couponCode.id}>{label}</label>
        <div className="mt-2 flex gap-1.5">
          <Input
            {...getInputProps(fields.couponCode, {
              required: true,
              type: 'text',
            })}
            disabled={disabled}
            errors={fields.couponCode.errors}
            id={fields.couponCode.id}
            key={fields.couponCode.id}
            placeholder={placeholder}
          />
          <SubmitButton disabled={disabled}>{ctaLabel}</SubmitButton>
        </div>
      </form>
      {optimisticCouponCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {optimisticCouponCodes.map((couponCode) => (
            <CouponChip
              action={formAction}
              couponCode={couponCode}
              key={couponCode}
              onSubmit={(formData) => {
                startTransition(() => {
                  formAction(formData);
                  setOptimisticCouponCodes(formData);
                });
              }}
              removeLabel={removeLabel}
            />
          ))}
        </div>
      )}
      {form.errors?.map((error, index) => <FieldError key={index}>{error}</FieldError>)}
    </div>
  );
}

function SubmitButton({ disabled, ...props }: React.ComponentPropsWithoutRef<typeof Button>) {
  const { pending } = useFormStatus();

  return (
    <Button
      {...props}
      className="shrink-0"
      disabled={disabled ?? pending}
      loading={pending}
      name="intent"
      size="small"
      type="submit"
      value="apply"
      variant="secondary"
    />
  );
}
