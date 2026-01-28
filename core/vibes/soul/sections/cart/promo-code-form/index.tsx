'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { startTransition, useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { promoCodeActionFormDataSchema } from '../schema';

import { PromoCodeChip } from './promo-code-chip';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface PromoCodeFormState {
  couponCodes: string[];
  giftCertificateCodes: string[];
  lastResult: SubmissionResult | null;
}

export interface PromoCodeFormProps {
  action: Action<PromoCodeFormState, FormData>;
  couponCodes?: string[];
  giftCertificateCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  couponRemoveLabel?: string;
  giftCertificateRemoveLabel?: string;
  requiredErrorMessage?: string;
}

export function PromoCodeForm({
  action,
  couponCodes,
  giftCertificateCodes,
  ctaLabel = 'Apply',
  disabled = false,
  label = 'Coupon/Gift Certificate',
  placeholder,
  couponRemoveLabel,
  giftCertificateRemoveLabel,
  requiredErrorMessage,
}: PromoCodeFormProps) {
  const [state, formAction] = useActionState(action, {
    couponCodes: couponCodes ?? [],
    giftCertificateCodes: giftCertificateCodes ?? [],
    lastResult: null,
  });

  const [optimisticCouponCodes, setOptimisticCouponCodes] = useOptimistic<string[], FormData>(
    state.couponCodes,
    (prevState, formData) => {
      const submission = parseWithZod(formData, {
        schema: promoCodeActionFormDataSchema({}),
      });

      if (submission.status !== 'success') return prevState;

      switch (submission.value.intent) {
        case 'delete-coupon': {
          const couponCode = submission.value.couponCode;

          return prevState.filter((code) => code !== couponCode);
        }

        default:
          return prevState;
      }
    },
  );

  const [optimisticGiftCertificateCodes, setOptimisticGiftCertificateCodes] = useOptimistic<
    string[],
    FormData
  >(state.giftCertificateCodes, (prevState, formData) => {
    const submission = parseWithZod(formData, {
      schema: promoCodeActionFormDataSchema({}),
    });

    if (submission.status !== 'success') return prevState;

    switch (submission.value.intent) {
      case 'delete-gift-certificate': {
        const giftCertificateCode = submission.value.giftCertificateCode;

        return prevState.filter((code) => code !== giftCertificateCode);
      }

      default:
        return prevState;
    }
  });

  const [form, fields] = useForm({
    lastResult: state.lastResult,
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: promoCodeActionFormDataSchema({ required_error: requiredErrorMessage }),
      });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setOptimisticCouponCodes(formData);
        setOptimisticGiftCertificateCodes(formData);
      });
    },
  });

  const handleCouponDelete = (couponCode: string) => {
    const formData = new FormData();
    formData.append('intent', 'delete-coupon');
    formData.append('couponCode', couponCode);

    startTransition(() => {
      formAction(formData);
      setOptimisticCouponCodes(formData);
    });
  };

  const handleGiftCertificateDelete = (giftCertificateCode: string) => {
    const formData = new FormData();
    formData.append('intent', 'delete-gift-certificate');
    formData.append('giftCertificateCode', giftCertificateCode);

    startTransition(() => {
      formAction(formData);
      setOptimisticGiftCertificateCodes(formData);
    });
  };

  return (
    <div className="space-y-2 border-t border-[var(--cart-border,hsl(var(--contrast-100)))] pb-5 pt-4">
      <form {...getFormProps(form)} action={formAction} className="space-y-2">
        <label htmlFor={fields.code.id}>{label}</label>
        <div className="mt-2 flex gap-1.5">
          <Input
            {...getInputProps(fields.code, {
              required: true,
              type: 'text',
            })}
            disabled={disabled}
            errors={fields.code.errors}
            id={fields.code.id}
            key={fields.code.id}
            placeholder={placeholder}
          />
          <SubmitButton disabled={disabled}>{ctaLabel}</SubmitButton>
        </div>
      </form>
      {(optimisticCouponCodes.length > 0 || optimisticGiftCertificateCodes.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
          {optimisticCouponCodes.map((couponCode) => {
            const formData = new FormData();
            formData.append('intent', 'delete-coupon');
            formData.append('couponCode', couponCode);

            return (
              <PromoCodeChip
                action={formAction}
                code={couponCode}
                key={couponCode}
                onSubmit={(fd) => {
                  handleCouponDelete(couponCode);
                }}
                removeLabel={couponRemoveLabel}
                type="coupon"
              />
            );
          })}
          {optimisticGiftCertificateCodes.map((giftCertificateCode) => {
            const formData = new FormData();
            formData.append('intent', 'delete-gift-certificate');
            formData.append('giftCertificateCode', giftCertificateCode);

            return (
              <PromoCodeChip
                action={formAction}
                code={giftCertificateCode}
                key={giftCertificateCode}
                onSubmit={(fd) => {
                  handleGiftCertificateDelete(giftCertificateCode);
                }}
                removeLabel={giftCertificateRemoveLabel}
                type="gift-certificate"
              />
            );
          })}
        </div>
      )}
      {form.errors?.map((error, index) => (
        <FieldError key={index}>{error}</FieldError>
      ))}
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
