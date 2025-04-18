'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/ui/form/form-status';
import { Input } from '@/ui/form/input';
import { Button } from '@/ui/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type SignInAction = Action<SubmissionResult | null, FormData>;

interface Props {
  action: SignInAction;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
}

export function SignInForm({
  action,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  submitLabel = 'Sign in',
}: Props) {
  const [lastResult, formAction] = useActionState(action, null);
  const [form, fields] = useForm({
    lastResult,
    defaultValue: { email: '', password: '' },
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
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
      <Input
        {...getInputProps(fields.password, { type: 'password' })}
        className="mb-6"
        errors={fields.password.errors}
        key={fields.password.id}
        label={passwordLabel}
      />
      <SubmitButton>{submitLabel}</SubmitButton>
      {form.errors?.map((error, index) => (
        <FormStatus key={index} type="error">
          {error}
        </FormStatus>
      ))}
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
