'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { parseWithZodTranslatedErrors } from '~/i18n/utils';

import { forgotPasswordErrorTranslations, schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ForgotPasswordAction = Action<
  { lastResult: SubmissionResult | null; successMessage?: string },
  FormData
>;

interface Props {
  action: ForgotPasswordAction;
  emailLabel?: string;
  submitLabel?: string;
}

export function ForgotPasswordForm({
  action,
  emailLabel = 'Email',
  submitLabel = 'Reset password',
}: Props) {
  const t = useTranslations('Auth.Login.ForgotPassword');
  const errorTranslations = forgotPasswordErrorTranslations(t);
  const [{ lastResult, successMessage }, formAction] = useActionState(action, { lastResult: null });
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZodTranslatedErrors(formData, { schema, errorTranslations });
    },
  });

  return (
    <form {...getFormProps(form)} action={formAction} className="flex grow flex-col gap-5">
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        errors={fields.email.errors}
        key={fields.email.id}
        label={emailLabel}
      />
      <SubmitButton>{submitLabel}</SubmitButton>
      {form.errors?.map((error, index) => (
        <FormStatus key={index} type="error">
          {error}
        </FormStatus>
      ))}
      {form.status === 'success' && successMessage != null && (
        <FormStatus>{successMessage}</FormStatus>
      )}
    </form>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button className="mt-auto w-full" loading={pending} type="submit" variant="secondary">
      {children}
    </Button>
  );
}
