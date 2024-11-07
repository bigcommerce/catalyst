'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useEffect } from 'react';
import { useFormState as useActionState } from 'react-dom';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ForgotPasswordAction = Action<SubmissionResult | null, FormData>;

type Props = {
  action: ForgotPasswordAction;
  emailLabel?: string;
  submitLabel?: string;
};

export function ForgotPasswordForm({
  action,
  emailLabel = 'Email',
  submitLabel = 'Reset password',
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
    if (lastResult?.error) console.log(lastResult.error);
  }, [lastResult]);

  return (
    <form {...getFormProps(form)} action={formAction} className="flex flex-grow flex-col gap-5">
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        errors={fields.email.errors}
        key={fields.email.id}
        label={emailLabel}
      />
      <Button className="mt-auto w-full" loading={isPending} type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}