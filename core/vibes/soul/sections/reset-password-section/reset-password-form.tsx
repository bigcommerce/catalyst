'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import { useActionState } from 'react';

import { PasswordComplexitySettings } from '@/vibes/soul/form/dynamic-form/schema';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { parseWithZodTranslatedErrors } from '~/i18n/utils';

import { resetPasswordErrorTranslations, resetPasswordSchema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ResetPasswordAction = Action<
  { lastResult: SubmissionResult | null; successMessage?: string },
  FormData
>;

interface Props {
  action: ResetPasswordAction;
  submitLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  passwordComplexitySettings?: PasswordComplexitySettings | null;
}

export function ResetPasswordForm({
  action,
  newPasswordLabel = 'New password',
  confirmPasswordLabel = 'Confirm Password',
  submitLabel = 'Update',
  passwordComplexitySettings,
}: Props) {
  const t = useTranslations('Auth.ChangePassword');
  const errorTranslations = resetPasswordErrorTranslations(t, passwordComplexitySettings);
  const schema = resetPasswordSchema(passwordComplexitySettings, errorTranslations);
  const [{ lastResult, successMessage }, formAction, isPending] = useActionState(action, {
    lastResult: null,
  });
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
    <form {...getFormProps(form)} action={formAction} className="space-y-5">
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
      <Button loading={isPending} size="small" type="submit" variant="secondary">
        {submitLabel}
      </Button>
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
