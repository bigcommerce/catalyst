/* eslint-disable complexity */
'use client';

import {
  FieldMetadata,
  FormProvider,
  getFormProps,
  getInputProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { useTranslations } from 'next-intl';
import {
  FormEvent,
  MouseEvent,
  ReactNode,
  startTransition,
  useActionState,
  useEffect,
} from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { CheckboxGroup } from '@/vibes/soul/form/checkbox-group';
import { DatePicker } from '@/vibes/soul/form/date-picker';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Button, ButtonProps } from '@/vibes/soul/primitives/button';

import {
  Field,
  FieldGroup,
  FormErrorTranslationMap,
  PasswordComplexitySettings,
  schema,
} from './schema';
import { removeOptionsFromFields } from './utils';

export interface DynamicFormActionArgs<F extends Field> {
  fields: Array<F | FieldGroup<F>>;
  passwordComplexity?: PasswordComplexitySettings | null;
}

type Action<F extends Field, S, P> = (
  args: DynamicFormActionArgs<F>,
  state: Awaited<S>,
  payload: P,
) => S | Promise<S>;

interface State {
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type DynamicFormAction<F extends Field> = Action<F, State, FormData>;

export interface DynamicFormProps<F extends Field> {
  fields: Array<F | FieldGroup<F>>;
  action: DynamicFormAction<F>;
  buttonSize?: ButtonProps['size'];
  cancelLabel?: string;
  submitLabel?: string;
  submitName?: string;
  submitValue?: string;
  onCancel?: (e: MouseEvent<HTMLButtonElement>) => void;
  onChange?: (e: FormEvent<HTMLFormElement>) => void;
  onSuccess?: (lastResult: SubmissionResult, successMessage: ReactNode) => void;
  passwordComplexity?: PasswordComplexitySettings | null;
  errorTranslations?: FormErrorTranslationMap;
}

export function DynamicForm<F extends Field>({
  action,
  fields,
  buttonSize = 'medium',
  cancelLabel = 'Cancel',
  submitLabel = 'Submit',
  submitName,
  submitValue,
  onCancel,
  onChange,
  onSuccess,
  passwordComplexity,
  errorTranslations,
}: DynamicFormProps<F>) {
  const t = useTranslations('Form');
  // Remove options from fields before passing to action to reduce payload size
  // Options are only needed for rendering, not for processing form submissions
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const fieldsWithoutOptions = removeOptionsFromFields(fields) as Array<F | FieldGroup<F>>;
  const actionWithFields = action.bind(null, { fields: fieldsWithoutOptions, passwordComplexity });

  const [{ lastResult, successMessage }, formAction] = useActionState(actionWithFields, {
    lastResult: null,
  });

  const dynamicSchema = schema(fields, passwordComplexity, errorTranslations);
  const defaultValue = fields
    .flatMap((f) => (Array.isArray(f) ? f : [f]))
    .reduce<z.infer<typeof dynamicSchema>>(
      (acc, field) => ({
        ...acc,
        [field.name]: 'defaultValue' in field ? field.defaultValue : '',
      }),
      {},
    );

  const [form, formFields] = useForm({
    lastResult,
    constraint: getZodConstraint(dynamicSchema),
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: dynamicSchema,
        errorMap: (issue) => {
          if (
            !errorTranslations &&
            issue.code === z.ZodIssueCode.invalid_string &&
            issue.validation === 'regex'
          ) {
            return { message: t('Errors.invalidFormat') };
          }

          if (!errorTranslations) {
            return { message: issue.message ?? t('Errors.invalidInput') };
          }

          const field = issue.path[0];
          const fieldKey = typeof field === 'string' ? field : '';
          const errorMessage = errorTranslations[fieldKey]?.[issue.code];

          return { message: errorMessage ?? issue.message ?? t('Errors.invalidInput') };
        },
      });
    },
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);
      });
    },
  });

  useEffect(() => {
    if (lastResult && lastResult.status === 'success' && successMessage) {
      onSuccess?.(lastResult, successMessage);
    }
  }, [lastResult, successMessage, onSuccess]);

  return (
    <FormProvider context={form.context}>
      <form {...getFormProps(form)} action={formAction} onChange={onChange}>
        <div className="space-y-6">
          {fields.map((field, index) => {
            if (Array.isArray(field)) {
              return (
                <div className="flex flex-col gap-4 @sm:flex-row" key={index}>
                  {field.map((f) => {
                    const groupFormField = formFields[f.name];

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

            const formField = formFields[field.name];

            if (formField == null) return null;

            return <DynamicFormField field={field} formField={formField} key={formField.id} />;
          })}
          <div className="flex gap-1 pt-3">
            {onCancel && (
              <Button
                aria-label={`${cancelLabel} ${submitLabel}`}
                onClick={onCancel}
                size={buttonSize}
                variant="tertiary"
              >
                {cancelLabel}
              </Button>
            )}
            <SubmitButton name={submitName} size={buttonSize} value={submitValue}>
              {submitLabel}
            </SubmitButton>
          </div>
          {form.errors?.map((error, index) => (
            <FormStatus key={index} type="error">
              {error}
            </FormStatus>
          ))}
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({
  children,
  name,
  value,
  size,
}: {
  children: ReactNode;
  name?: string;
  value?: string;
  size: ButtonProps['size'];
}) {
  const { pending } = useFormStatus();

  return (
    <Button loading={pending} name={name} size={size} type="submit" value={value}>
      {children}
    </Button>
  );
}

function DynamicFormField({
  field,
  formField,
}: {
  field: Field;
  formField: FieldMetadata<string | string[] | number | boolean | Date | undefined>;
}) {
  const controls = useInputControl(formField);

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          {...getInputProps(formField, { type: 'number' })}
          decrementLabel={field.decrementLabel}
          defaultValue={field.defaultValue}
          errors={formField.errors}
          incrementLabel={field.incrementLabel}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'text':
      return (
        <Input
          {...getInputProps(formField, { type: 'text', pattern: field.pattern })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'textarea':
      return (
        <Textarea
          {...getInputProps(formField, { type: 'text' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'password':
    case 'confirm-password':
      return (
        <Input
          {...getInputProps(formField, { type: 'password' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'email':
      return (
        <Input
          {...getInputProps(formField, { type: 'email' })}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          placeholder={field.placeholder}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          defaultValue={field.defaultValue}
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => controls.change(String(value))}
          onFocus={controls.focus}
          required={field.required}
          value={controls.value}
        />
      );

    case 'checkbox-group':
      return (
        <CheckboxGroup
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onValueChange={controls.change}
          options={field.options}
          required={field.required}
          value={Array.isArray(controls.value) ? controls.value : []}
        />
      );

    case 'select':
      return (
        <Select
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          placeholder={field.placeholder}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={controls.change}
          options={field.options}
          required={formField.required}
          value={typeof controls.value === 'string' ? controls.value : ''}
        />
      );

    case 'date':
      return (
        <DatePicker
          defaultValue={field.defaultValue}
          disabledDays={
            field.minDate != null && field.maxDate != null
              ? {
                  before: new Date(field.minDate),
                  after: new Date(field.maxDate),
                }
              : undefined
          }
          errors={formField.errors}
          key={field.name}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onSelect={(date) =>
            controls.change(date ? Intl.DateTimeFormat().format(date) : undefined)
          }
          required={formField.required}
          selected={typeof controls.value === 'string' ? new Date(controls.value) : undefined}
        />
      );
  }
}
