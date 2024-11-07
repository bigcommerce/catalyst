'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useEffect } from 'react';
import { useFormState as useActionState } from 'react-dom';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type SignUpAction = Action<SubmissionResult | null, FormData>;

type Props = {
  action: SignUpAction;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  passwordLabel?: string;
  confirmPasswordLabel?: string;
  submitLabel?: string;
};

export function SignUpForm({
  action,
  firstNameLabel = 'First name',
  lastNameLabel = 'Last name',
  emailLabel = 'Email',
  passwordLabel = 'Password',
  confirmPasswordLabel = 'Confirm password',
  submitLabel = 'Sign up',
}: Props) {
  const [lastResult, formAction, isPending] = useActionState(action, null);
  const [form, fields] = useForm({
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
      <div className="flex gap-5">
        <Input
          {...getInputProps(fields.firstName, { type: 'text' })}
          errors={fields.firstName.errors}
          key={fields.firstName.id}
          label={firstNameLabel}
        />
        <Input
          {...getInputProps(fields.lastName, { type: 'text' })}
          errors={fields.lastName.errors}
          key={fields.lastName.id}
          label={lastNameLabel}
        />
      </div>
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        errors={fields.email.errors}
        key={fields.email.id}
        label={emailLabel}
      />
      <Input
        {...getInputProps(fields.password, { type: 'password' })}
        errors={fields.password.errors}
        key={fields.password.id}
        label={passwordLabel}
      />
      <Input
        {...getInputProps(fields.confirmPassword, { type: 'password' })}
        className="mb-6"
        errors={fields.confirmPassword.errors}
        key={fields.confirmPassword.id}
        label={confirmPasswordLabel}
      />
      <Button className="mt-auto w-full" loading={isPending} type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
