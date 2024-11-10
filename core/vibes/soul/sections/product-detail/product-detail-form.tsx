'use client';

import {
  FieldMetadata,
  FormProvider,
  getFormProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { parseAsString, useQueryState, useQueryStates } from 'nuqs';
import { useCallback } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Button } from '@/vibes/soul/primitives/button';

import { Field, schema, SchemaRawShape } from './schema';

type Action<State, Payload> = (state: Awaited<State>, payload: Payload) => State | Promise<State>;

type State<F extends Field> = {
  fields: F[];
  lastResult: SubmissionResult | null;
};

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

type Props<F extends Field> = {
  fields: F[];
  action: ProductDetailFormAction<F>;
  productId: string;
  ctaLabel?: string;
};

export function ProductDetailForm<F extends Field>({
  action,
  fields,
  productId,
  ctaLabel = 'Add to cart',
}: Props<F>) {
  const [params] = useQueryStates(
    fields.reduce<Record<string, typeof parseAsString>>(
      (acc, field) => {
        return { ...acc, [field.name]: parseAsString };
      },
      { quantity: parseAsString },
    ),
    { shallow: false },
  );
  const defaultValue = fields.reduce<{
    [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
  }>(
    (acc, field) => ({
      ...acc,
      [field.name]: params[field.name] ?? field.defaultValue ?? '',
    }),
    { quantity: 1 },
  );
  const [{ lastResult }, formAction] = useFormState(action, {
    fields,
    lastResult: null,
  });
  const [form, formFields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema(fields)),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema(fields) });
    },
    // @ts-expect-error: `defaultValue` types are conflicting with `onValidate`.
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  });
  const quantityControl = useInputControl(formFields.quantity);

  return (
    <FormProvider context={form.context}>
      <form {...getFormProps(form)} action={formAction}>
        <input name="id" type="hidden" value={productId} />
        <div className="space-y-6">
          {fields.map((field) => {
            return (
              <FormField
                field={field}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                formField={formFields[field.name]!}
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                key={formFields[field.name]!.id}
              />
            );
          })}
          <div className="flex gap-x-3 pt-3">
            <NumberInput
              id={formFields.quantity.id}
              label=""
              min={1}
              name={formFields.quantity.name}
              onBlur={quantityControl.blur}
              onChange={(e) => quantityControl.change(e.currentTarget.value)}
              onFocus={quantityControl.focus}
              required
              value={quantityControl.value}
            />
            <SubmitButton>{ctaLabel}</SubmitButton>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button className="w-auto @xl:w-56" loading={pending} size="medium" type="submit">
      {children}
    </Button>
  );
}

function FormField({
  field,
  formField,
}: {
  field: Field;
  formField: FieldMetadata<string | number | boolean | Date | undefined>;
}) {
  const controls = useInputControl(formField);
  const [, setParam] = useQueryState(field.name, parseAsString.withOptions({ shallow: false }));

  const handleChange = useCallback(
    (value: string) => {
      void setParam(value);
      controls.change(value);
    },
    [setParam, controls],
  );

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'text':
      return (
        <Input
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => handleChange(String(value))}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'select':
      return (
        <Select
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          id={formField.id}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value}
        />
      );
  }
}
