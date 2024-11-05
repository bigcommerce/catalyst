'use client';

import { useEffect } from 'react';

import { SubmissionResult, getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';
import { useFormState } from 'react-dom';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type SignUpAction = Action<SubmissionResult | null, FormData>;

type Props = {
  action: SignUpAction;
  submitLabel?: string;
};

export function SignUpForm({ action, submitLabel = 'Sign up' }: Props) {
  const [lastResult, formAction, isPending] = useFormState(action, null);
  const [form, fields] = useForm({
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });

  useEffect(() => {
    if (lastResult?.error) return console.log(lastResult.error);
  }, [lastResult]);

  return (
    <form {...getFormProps(form)} className="flex flex-grow flex-col gap-5" action={formAction}>
      <div className="flex gap-5">
        <Input
          {...getInputProps(fields.firstName, { type: 'text' })}
          key={fields.firstName.id}
          errors={fields.firstName.errors}
          label="First name"
        />
        <Input
          {...getInputProps(fields.lastName, { type: 'text' })}
          key={fields.lastName.id}
          errors={fields.lastName.errors}
          label="Last name"
        />
      </div>
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        key={fields.email.id}
        errors={fields.email.errors}
        label="Email"
      />
      <Input
        {...getInputProps(fields.password, { type: 'password' })}
        key={fields.password.id}
        errors={fields.password.errors}
        label="Password"
      />
      <Input
        {...getInputProps(fields.confirmPassword, { type: 'password' })}
        key={fields.confirmPassword.id}
        errors={fields.confirmPassword.errors}
        className="mb-6"
        label="Confirm password"
      />
      <Button type="submit" variant="secondary" className="mt-auto w-full" loading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
