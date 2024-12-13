'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState } from 'react';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

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
}

export function ResetPasswordForm({
  action,
  newPasswordLabel = 'New password',
  confirmPasswordLabel = 'Confirm Password',
  submitLabel = 'Update',
}: Props) {
  const [{ lastResult, successMessage }, formAction, isPending] = useActionState(action, {
    lastResult: null,
  });
  const [form, fields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
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
