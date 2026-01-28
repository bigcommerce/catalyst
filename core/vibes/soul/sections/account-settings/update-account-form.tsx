'use client';

import { getFormProps, getInputProps, SubmissionResult, useForm } from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useOptimistic, useTransition } from 'react';
import { z } from 'zod';

import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { parseWithZodTranslatedErrors } from '~/i18n/utils';

import { updateAccountErrorTranslations, updateAccountSchema } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

export type UpdateAccountAction = Action<State, FormData>;

export type Account = z.infer<typeof updateAccountSchema>;

interface State {
  account: Account;
  successMessage?: string;
  lastResult: SubmissionResult | null;
}

export interface UpdateAccountFormProps {
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
  const t = useTranslations('Account.Settings');
  const errorTranslations = updateAccountErrorTranslations(t);
  const [state, formAction] = useActionState(action, { account, lastResult: null });
  const [pending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic<State, FormData>(
    state,
    (prevState, formData) => {
      const intent = formData.get('intent');
      const submission = parseWithZodTranslatedErrors(formData, {
        schema: updateAccountSchema,
        errorTranslations,
      });

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
      return parseWithZodTranslatedErrors(formData, {
        schema: updateAccountSchema,
        errorTranslations,
      });
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
