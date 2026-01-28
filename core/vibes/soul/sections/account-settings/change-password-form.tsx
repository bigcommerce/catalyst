'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import { ReactNode, useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { PasswordComplexitySettings } from '@/vibes/soul/form/dynamic-form/schema';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { parseWithZodTranslatedErrors } from '~/i18n/utils';

import { changePasswordErrorTranslations, changePasswordSchema } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: string;
}

export type ChangePasswordAction = Action<State, FormData>;

export interface ChangePasswordFormProps {
  action: ChangePasswordAction;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  submitLabel?: string;
  passwordComplexitySettings?: PasswordComplexitySettings | null;
}

export function ChangePasswordForm({
  action,
  currentPasswordLabel = 'Current password',
  newPasswordLabel = 'New password',
  confirmPasswordLabel = 'Confirm password',
  submitLabel = 'Update',
  passwordComplexitySettings,
}: ChangePasswordFormProps) {
  const t = useTranslations('Account.Settings');
  const errorTranslations = changePasswordErrorTranslations(t, passwordComplexitySettings);
  const schema = changePasswordSchema(passwordComplexitySettings, errorTranslations);
  const [state, formAction] = useActionState(action, { lastResult: null });
  const [form, fields] = useForm({
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZodTranslatedErrors(formData, { schema, errorTranslations });
    },
  });

  useEffect(() => {
    if (state.lastResult?.status === 'success' && state.successMessage != null) {
      toast.success(state.successMessage);
    }

    if (state.lastResult?.error) {
      // eslint-disable-next-line no-console
      console.log(state.lastResult.error);
    }
  }, [state]);

  return (
    <form {...getFormProps(form)} action={formAction} className="space-y-5">
      <Input
        {...getInputProps(fields.currentPassword, { type: 'password' })}
        errors={fields.currentPassword.errors}
        key={fields.currentPassword.id}
        label={currentPasswordLabel}
      />
      <Input
        {...getInputProps(fields.password, { type: 'password' })}
        errors={fields.password.errors}
        key={fields.password.id}
        label={newPasswordLabel}
      />
      <Input
        {...getInputProps(fields.confirmPassword, { type: 'password' })}
        className="mb-6"
        errors={fields.confirmPassword.errors}
        key={fields.confirmPassword.id}
        label={confirmPasswordLabel}
      />
      <SubmitButton>{submitLabel}</SubmitButton>
    </form>
  );
}

function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} size="small" type="submit" variant="secondary">
      {children}
    </Button>
  );
}
