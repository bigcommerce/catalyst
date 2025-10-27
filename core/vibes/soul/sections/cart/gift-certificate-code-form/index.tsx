'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { startTransition, useActionState, useOptimistic } from 'react';
import { useFormStatus } from 'react-dom';

import { FieldError } from '@/vibes/soul/form/field-error';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { giftCertificateCodeActionFormDataSchema } from '../schema';

import { GiftCertificateChip } from './gift-certificate-chip';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export interface GiftCertificateCodeFormState {
  giftCertificateCodes: string[];
  lastResult: SubmissionResult | null;
}

export interface GiftCertificateCodeFormProps {
  action: Action<GiftCertificateCodeFormState, FormData>;
  giftCertificateCodes?: string[];
  ctaLabel?: string;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
  removeLabel?: string;
  requiredErrorMessage?: string;
}

export function GiftCertificateCodeForm({
  action,
  giftCertificateCodes,
  ctaLabel = 'Apply',
  disabled = false,
  label = 'Gift certificate code',
  placeholder,
  removeLabel,
  requiredErrorMessage,
}: GiftCertificateCodeFormProps) {
  const [state, formAction] = useActionState(action, {
    giftCertificateCodes: giftCertificateCodes ?? [],
    lastResult: null,
  });

  const schema = giftCertificateCodeActionFormDataSchema({ required_error: requiredErrorMessage });

  const [optimisticGiftCertificateCodes, setOptimisticGiftCertificateCodes] = useOptimistic<
    string[],
    FormData
  >(state.giftCertificateCodes, (prevState, formData) => {
    const submission = parseWithZod(formData, { schema });

    if (submission.status !== 'success') return prevState;

    switch (submission.value.intent) {
      case 'delete': {
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
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
        setOptimisticGiftCertificateCodes(formData);
      });
    },
  });

  return (
    <div className="space-y-2 border-t border-[var(--cart-border,hsl(var(--contrast-100)))] pb-5 pt-4">
      <form {...getFormProps(form)} action={formAction} className="space-y-2">
        <label htmlFor={fields.giftCertificateCode.id}>{label}</label>
        <div className="mt-2 flex gap-1.5">
          <Input
            {...getInputProps(fields.giftCertificateCode, {
              required: true,
              type: 'text',
            })}
            disabled={disabled}
            errors={fields.giftCertificateCode.errors}
            id={fields.giftCertificateCode.id}
            key={fields.giftCertificateCode.id}
            placeholder={placeholder}
          />
          <SubmitButton disabled={disabled}>{ctaLabel}</SubmitButton>
        </div>
      </form>
      {optimisticGiftCertificateCodes.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {optimisticGiftCertificateCodes.map((giftCertificateCode) => (
            <GiftCertificateChip
              action={formAction}
              giftCertificateCode={giftCertificateCode}
              key={giftCertificateCode}
              onSubmit={(formData) => {
                startTransition(() => {
                  formAction(formData);
                  setOptimisticGiftCertificateCodes(formData);
                });
              }}
              removeLabel={removeLabel}
            />
          ))}
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
