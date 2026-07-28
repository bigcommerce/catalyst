'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type SignInAction = Action<SubmissionResult | null, FormData>;

interface Props {
  action: SignInAction;
  emailLabel?: string;
  passwordLabel?: string;
  submitLabel?: string;
  error?: string;
}

export function SignInForm({
  action,
  emailLabel = 'Email',
  passwordLabel = 'Password',
  submitLabel = 'Sign in',
  error,
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

  useEffect(() => {
    // If the form errors change when an "error" search param is in the URL,
    // the search param should be removed to prevent showing stale errors.
    if (form.errors) {
      const url = new URL(window.location.href);

      if (url.searchParams.has('error')) {
        url.searchParams.delete('error');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [form.errors]);

  const formErrors = () => {
    // Form errors should take precedence over the error prop that is passed in.
    // This ensures that the most recent errors are displayed to avoid confusion.
    if (form.errors) {
      return form.errors;
    }

    if (error) {
      return [error];
    }

    return [];
  };

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
      {formErrors().map((err, index) => (
        <FormStatus key={index} type="error">
          {err}
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
