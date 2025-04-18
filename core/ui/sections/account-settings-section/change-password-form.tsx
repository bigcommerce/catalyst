'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { Input } from '@/ui/form/input';
import { Button } from '@/ui/primitives/button';

import { changePasswordSchema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ChangePasswordAction = Action<SubmissionResult | null, FormData>;

interface Props {
  action: ChangePasswordAction;
  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  submitLabel?: string;
}

export function ChangePasswordForm({
  action,
  currentPasswordLabel = 'Current password',
  newPasswordLabel = 'New password',
  confirmPasswordLabel = 'Confirm password',
  submitLabel = 'Update',
}: Props) {
  const [lastResult, formAction] = useActionState(action, null);
  const [form, fields] = useForm({
    constraint: getZodConstraint(changePasswordSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: changePasswordSchema });
    },
  });

  useEffect(() => {
    if (lastResult?.error) {
      // eslint-disable-next-line no-console
      console.log(lastResult.error);
    }
  }, [lastResult]);

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

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} size="small" type="submit" variant="secondary">
      {children}
    </Button>
  );
}
