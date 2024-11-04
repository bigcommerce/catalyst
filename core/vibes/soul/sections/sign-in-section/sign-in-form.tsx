'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useEffect } from 'react';
import { useFormState } from 'react-dom';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type SignInAction = Action<SubmissionResult | null, FormData>;

interface Props {
  action: SignInAction;
  submitLabel?: string;
}

export function SignInForm({ action, submitLabel = 'Sign in' }: Props) {
  const [lastResult, formAction, isPending] = useFormState(action, null);
  const [form, fields] = useForm({
    defaultValue: { email: '', password: '' },
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    if (lastResult?.error) {
      console.log(lastResult.error);
    }
  }, [lastResult]);

  return (
    <form {...getFormProps(form)} action={formAction} className="flex flex-grow flex-col gap-5">
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        errors={fields.email.errors}
        key={fields.email.id}
        label="Email"
      />
      <Input
        {...getInputProps(fields.password, { type: 'password' })}
        className="mb-6"
        errors={fields.password.errors}
        key={fields.password.id}
        label="Password"
      />
      <Button className="mt-auto w-full" loading={isPending} type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
