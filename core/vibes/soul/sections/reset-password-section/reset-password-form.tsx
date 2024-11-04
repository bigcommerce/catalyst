'use client';

import { useEffect } from 'react';

import { SubmissionResult, getFormProps, getInputProps, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { schema } from './schema';
import { useFormState } from 'react-dom';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type ResetPasswordAction = Action<SubmissionResult | null, FormData>;

type Props = {
  action: ResetPasswordAction;
  submitLabel?: string;
};

export function ResetPasswordForm({ action, submitLabel = 'Reset password' }: Props) {
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
      <Input
        {...getInputProps(fields.email, { type: 'text' })}
        key={fields.email.id}
        errors={fields.email.errors}
        label="Email"
      />
      <Button type="submit" variant="secondary" className="mt-auto w-full" loading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
