'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useActionState, useEffect, useOptimistic, useTransition } from 'react';
import { z } from 'zod';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';

import { updateAccountSchema } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

export type UpdateAccountAction = Action<State, FormData>;

export type Account = z.infer<typeof updateAccountSchema>;

interface State {
  account: Account;
  successMessage?: string;
  lastResult: SubmissionResult | null;
}

interface UpdateAccountFormProps {
  action: UpdateAccountAction;
  account: Account;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  companyLabel?: string;
  submitLabel?: string;
}

export function UpdateAccountForm({
  action,
  account,
  firstNameLabel = 'First name',
  lastNameLabel = 'Last name',
  emailLabel = 'Email',
  companyLabel = 'Company',
  submitLabel = 'Update',
}: UpdateAccountFormProps) {
  const [state, formAction] = useActionState(action, { account, lastResult: null });
  const [pending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic<State, FormData>(
    state,
    (prevState, formData) => {
      const intent = formData.get('intent');
      const submission = parseWithZod(formData, { schema: updateAccountSchema });

      if (submission.status !== 'success') return prevState;

      switch (intent) {
        case 'update': {
          return {
            ...prevState,
            account: submission.value,
          };
        }

        default:
          return prevState;
      }
    },
  );

  const [form, fields] = useForm({
    lastResult: state.lastResult,
    defaultValue: optimisticState.account,
    constraint: getZodConstraint(updateAccountSchema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: updateAccountSchema });
    },
  });

  useEffect(() => {
    if (state.lastResult?.status === 'success' && typeof state.successMessage === 'string') {
      toast.success(state.successMessage);
    }
  }, [state]);

  return (
    <form
      {...getFormProps(form)}
      action={(formData) => {
        startTransition(() => {
          formAction(formData);
          setOptimisticState(formData);
        });
      }}
      className="space-y-5"
    >
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
        {...getInputProps(fields.company, { type: 'text' })}
        errors={fields.company.errors}
        key={fields.company.id}
        label={companyLabel}
      />
      <Button
        loading={pending}
        name="intent"
        size="small"
        type="submit"
        value="update"
        variant="secondary"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
