'use client';

import {
  FieldMetadata,
  FormProvider,
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
} from '@conform-to/react';
import { getZodConstraint } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import { useActionState, useEffect, useOptimistic, useTransition } from 'react';
import { z } from 'zod';

import { DynamicFormField } from '@/vibes/soul/form/dynamic-form';
import { Field, FieldGroup } from '@/vibes/soul/form/dynamic-form/schema';
import { Input } from '@/vibes/soul/form/input';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { parseWithZodTranslatedErrors } from '~/i18n/utils';

import { updateAccountErrorTranslations, updateAccountSchema } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

export type UpdateAccountAction = Action<State, FormData>;

export type Account = z.infer<ReturnType<typeof updateAccountSchema>>;

export interface State {
  account: Account;
  successMessage?: string;
  lastResult: SubmissionResult | null;
}

function getDynamicFormField(
  fields: object,
  name: string,
): FieldMetadata<string | string[] | number | boolean | Date | undefined> | undefined {
  // `fields` is conform's static, schema-derived shape; custom fields are looked up dynamically
  // by name, which has no static index signature to type against.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Reflect.get(fields, name);
}

export interface UpdateAccountFormProps {
  action: UpdateAccountAction;
  account: Account;
  /* Merchant-defined required/custom customer fields (e.g. a "Terms and Conditions" checkbox
   added after this account existed). BigCommerce re-validates these on every updateCustomer
   call, so they must be rendered and submitted in this same form, not a separate one. */
  customFields?: Array<Field | FieldGroup<Field>>;
  firstNameLabel?: string;
  lastNameLabel?: string;
  emailLabel?: string;
  companyLabel?: string;
  submitLabel?: string;
}

export function UpdateAccountForm({
  action,
  account,
  customFields = [],
  firstNameLabel = 'First name',
  lastNameLabel = 'Last name',
  emailLabel = 'Email',
  companyLabel = 'Company',
  submitLabel = 'Update',
}: UpdateAccountFormProps) {
  const t = useTranslations('Account.Settings');
  const errorTranslations = updateAccountErrorTranslations(t);
  const schema = updateAccountSchema(customFields);
  const [state, formAction] = useActionState(action, { account, lastResult: null });
  const [pending, startTransition] = useTransition();

  const [optimisticState, setOptimisticState] = useOptimistic<State, FormData>(
    state,
    (prevState, formData) => {
      const intent = formData.get('intent');
      const submission = parseWithZodTranslatedErrors(formData, {
        schema,
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

  const customFieldsDefaultValue = customFields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .reduce<
      Record<string, unknown>
    >((acc, f) => ({ ...acc, [f.name]: 'defaultValue' in f ? f.defaultValue : '' }), {});

  const [form, fields] = useForm({
    lastResult: state.lastResult,
    defaultValue: { ...optimisticState.account, ...customFieldsDefaultValue },
    constraint: getZodConstraint(schema),
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
    onValidate({ formData }) {
      return parseWithZodTranslatedErrors(formData, {
        schema,
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
    <FormProvider context={form.context}>
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
        {customFields.map((field, index) => {
          if (Array.isArray(field)) {
            return (
              <div className="flex gap-5" key={index}>
                {field.map((f) => {
                  const groupFormField = getDynamicFormField(fields, f.name);

                  if (!groupFormField) return null;

                  return (
                    <DynamicFormField
                      field={f}
                      formField={groupFormField}
                      key={groupFormField.id}
                    />
                  );
                })}
              </div>
            );
          }

          const formField = getDynamicFormField(fields, field.name);

          if (!formField) return null;

          return <DynamicFormField field={field} formField={formField} key={formField.id} />;
        })}
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
    </FormProvider>
  );
}
