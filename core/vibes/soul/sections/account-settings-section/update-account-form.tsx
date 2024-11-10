'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState, useEffect } from 'react';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';

import { updateAccountSchema } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

export type UpdateAccountAction = Action<SubmissionResult | null, FormData>;

type Props = {
  action: UpdateAccountAction;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  submitLabel?: string;
};

export function UpdateAccountForm({
  action,
  firstNameLabel = 'First name',
  lastNameLabel = 'Last name',
  emailLabel = 'Email',
  submitLabel = 'Update',
}: Props) {
  const [lastResult, formAction, isPending] = useActionState(action, null);
  const [form, fields] = useForm({
    constraint: getZodConstraint(updateAccountSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateAccountSchema });
    },
  });

  useEffect(() => {
    if (lastResult?.error) {
      console.log(lastResult.error);
    }
  }, [lastResult]);

  return (
    <form {...getFormProps(form)} action={formAction} className="space-y-5">
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
      <Button loading={isPending} size="small" type="submit" variant="secondary">
        {submitLabel}
      </Button>
    </form>
  );
}
