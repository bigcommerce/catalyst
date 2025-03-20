'use client';

import {
  FieldMetadata,
  FormProvider,
  FormStateInput,
  getFormProps,
  SubmissionResult,
  useForm,
  useInputControl,
} from '@conform-to/react';
import { getZodConstraint, parseWithZod } from '@conform-to/zod';
import { createSerializer, parseAsString, useQueryStates } from 'nuqs';
import { ReactNode, useActionState, useCallback, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { Select } from '@/vibes/soul/form/select';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { B2BProductOption } from '~/b2b/types';
import { AddToQuoteButton } from '~/components/add-to-quote-button';
import { usePathname, useRouter } from '~/i18n/routing';

import { Field, schema, SchemaRawShape } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<F extends Field> {
  fields: F[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

interface Props<F extends Field> {
  fields: F[];
  action: ProductDetailFormAction<F>;
  productId: string;
  sku: string;
  ctaLabel?: string;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  ctaDisabled?: boolean;
  prefetch?: boolean;
}

interface FormField {
  id: number;
  type: string;
  name: string;
  value?: string | number;
  options?: Array<{
    id: number;
    value: string;
    label: string;
    color?: string;
  }>;
}

export function ProductDetailForm<F extends Field>({
  action,
  fields,
  productId,
  ctaLabel = 'Add to cart',
  quantityLabel = 'Quantity',
  incrementLabel = 'Increase quantity',
  decrementLabel = 'Decrease quantity',
  ctaDisabled = false,
  prefetch = false,
  sku,
}: Props<F>) {
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = fields.reduce<Record<string, typeof parseAsString>>((acc, field) => {
    return field.persist === true ? { ...acc, [field.name]: parseAsString } : acc;
  }, {});

  const [params] = useQueryStates(searchParams, { shallow: false });

  const onPrefetch = (fieldName: string, value: string) => {
    if (prefetch) {
      const serialize = createSerializer(searchParams);

      const newUrl = serialize(pathname, { ...params, [fieldName]: value });

      router.prefetch(newUrl);
    }
  };
  
  const validateQuote = () =>  {
    const data = new FormData()
    const formValues = {...(form.value ?? {})}
    Object.entries(formValues).map(([key, value]) => {
      if (typeof value === 'string') {
        data.append(key, value)
      }
    })

    const zodError = parseWithZod(data, { schema: schema(fields) });
    if(zodError.status === 'error') {
      form.validate()
      throw new Error('Invalid form data')
    } 
  }

  const defaultValue = fields.reduce<{
    [Key in keyof SchemaRawShape]?: z.infer<SchemaRawShape[Key]>;
  }>(
    (acc, field) => ({
      ...acc,
      [field.name]: params[field.name] ?? field.defaultValue ?? '',
    }),
    { quantity: 1 },
  );

  const [{ lastResult, successMessage }, formAction] = useActionState(action, {
    fields,
    lastResult: null,
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);
    }
  }, [lastResult, successMessage]);

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

  function transformToB2BProductOption(field: FormField): B2BProductOption {
    const baseOption: B2BProductOption = {
      optionEntityId: field.id,
      optionValueEntityId: 0, // Will be set based on type
      entityId: field.id,
      valueEntityId: 0, // Will be set based on type
      text: '',
      number: 0,
      date: { utc: '' },
    };

    switch (field.type) {
      case 'text':
      case 'textarea':
        return {
          ...baseOption,
          text: String(field.value || ''),
        };

      case 'number':
        return {
          ...baseOption,
          number: Number(field.value || 0),
        };

      case 'date':
        return {
          ...baseOption,
          date: field.value ? { utc: new Date(field.value).toISOString() } : { utc: '' },
        };

      case 'button-radio-group':
      case 'swatch-radio-group':
      case 'radio-group':
      case 'card-radio-group':
      case 'select': {
        const selectedOption = field.options?.find((opt) => opt.value === String(field.value));

        return {
          ...baseOption,
          optionValueEntityId: selectedOption?.id || 0,
          valueEntityId: selectedOption?.id || 0,
          text: selectedOption?.label || '',
        };
      }

      default:
        return baseOption;
    }
  }

  const selectedOptions = fields.map((field) =>
    transformToB2BProductOption({
      id: Number(field.name),
      type: field.type,
      name: field.name,
      value: formFields[field.name]?.value,
      options:
        'options' in field
          ? field.options.map((opt) => ({
              ...opt,
              id: Number(opt.value),
            }))
          : undefined,
    }),
  );

  const quantityControl = useInputControl(formFields.quantity);

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction} className="py-8">
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
                onPrefetch={onPrefetch}
              />
            );
          })}
          {form.errors?.map((error, index) => (
            <FormStatus className="pt-3" key={index} type="error">
              {error}
            </FormStatus>
          ))}
          <div className="flex gap-x-3 pt-3">
            <NumberInput
              aria-label={quantityLabel}
              decrementLabel={decrementLabel}
              incrementLabel={incrementLabel}
              min={1}
              name={formFields.quantity.name}
              onBlur={quantityControl.blur}
              onChange={(e) => quantityControl.change(e.currentTarget.value)}
              onFocus={quantityControl.focus}
              required
              value={quantityControl.value}
            />
            <div className="flex flex-1 gap-x-3">
              <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
              <AddToQuoteButton
                validate={validateQuote}
                className="flex-1"
                productEntityId={productId}
                quantity={Number(quantityControl.value)}
                selectedOptions={selectedOptions}
                sku={sku}
              />
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-auto flex-1 @xl:w-56"
      disabled={disabled}
      loading={pending}
      size="medium"
      type="submit"
    >
      {children}
    </Button>
  );
}

function FormField({
  field,
  formField,
  onPrefetch,
}: {
  field: Field;
  formField: FieldMetadata<string | number | boolean | Date | undefined>;
  onPrefetch: (fieldName: string, value: string) => void;
}) {
  const controls = useInputControl(formField);

  const [, setParams] = useQueryStates(
    field.persist === true ? { [field.name]: parseAsString.withOptions({ shallow: false }) } : {},
  );

  const handleChange = useCallback(
    (value: string) => {
      void setParams({ [field.name]: value });
      controls.change(value);
    },
    [setParams, field, controls],
  );

  const handleOnOptionMouseEnter = (value: string) => {
    if (field.persist === true) {
      onPrefetch(field.name, value);
    }
  };

  switch (field.type) {
    case 'number':
      return (
        <NumberInput
          decrementLabel={field.decrementLabel}
          errors={formField.errors}
          incrementLabel={field.incrementLabel}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'text':
      return (
        <Input
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'checkbox':
      return (
        <Checkbox
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => handleChange(String(value))}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? 'false'}
        />
      );

    case 'select':
      return (
        <Select
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'radio-group':
      return (
        <RadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'swatch-radio-group':
      return (
        <SwatchRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'card-radio-group':
      return (
        <CardRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'button-radio-group':
      return (
        <ButtonRadioGroup
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );
  }
}
