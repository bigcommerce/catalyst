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
  ctaLabel?: string;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  ctaDisabled?: boolean;
  prefetch?: boolean;
  inventoryLevel?: any;
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
  inventoryLevel,
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
    successMessage: 'Product added to cart successfully!',
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);

      // This is needed to refresh the Data Cache after the product has been added to the cart.
      // The cart id is not picked up after the first time the cart is created/updated.
      router.refresh();
    }
  }, [lastResult, successMessage, router]);

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
    onSubmit: () => {
      // The actual submission is handled by `useActionState` above.
      toast.success('Product added to cart successfully!');
    },
  });

  const quantityControl = useInputControl(formFields.quantity);

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction} className="py-8">
        <input name="id" type="hidden" value={productId} />
        <input type="hidden" name="action" value="add" />

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
          {/* <div>
            {inventoryLevel?.value && (
              <p className="text-lg italic text-gray-500">
                Available Inventory: <span className="bold">{inventoryLevel?.value}</span>
              </p>
            )}
          </div> */}
          <div className="flex gap-x-3 pt-3">
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-8 sm:gap-3">
              {/* Quantity input: full width on mobile, 3/8 on desktop */}
              <div className="col-span-1 w-full sm:col-span-2">
                <NumberInput
                  aria-label={quantityLabel}
                  decrementLabel={decrementLabel}
                  incrementLabel={incrementLabel}
                  min={1}
                  max={parseInt(inventoryLevel?.value, 10) ?? 9999}
                  name={formFields.quantity.name}
                  onBlur={quantityControl.blur}
                  onChange={(e) => {
                    const valueToChangeTo = e.currentTarget.value;

                    if (
                      !ctaDisabled &&
                      parseInt(inventoryLevel?.value, 10) >= Number(valueToChangeTo)
                    ) {
                      return quantityControl.change(valueToChangeTo);
                    } else {
                      toast.error(
                        'Sorry, we do not have enough inventory to fulfill your request.',
                      );
                    }
                  }}
                  onFocus={quantityControl.focus}
                  required
                  value={quantityControl.value}
                  className="w-full"
                  buttonClassName="w-full"
                />
              </div>
              {/* Buttons: stacked and full width on mobile, side by side on desktop */}
              <div className="col-span-1 flex w-full flex-col gap-3 sm:col-span-6 sm:flex-row">
                <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
                <B2BNinjaAddToQuoteButton
                  disabled={ctaDisabled}
                  productId={productId}
                  quantity={quantityControl.value}
                />
              </div>
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
      className="w-auto text-white @xl:w-56"
      disabled={disabled}
      loading={pending}
      size="medium"
      type="submit"
    >
      {children}
    </Button>
  );
}

function B2BNinjaAddToQuoteButton({
  disabled,
  productId,
  quantity,
}: {
  disabled?: boolean;
  productId: string;
  quantity?: string;
}) {
  return (
    <Button
      id="qn-cart-to-quote"
      type="submit"
      size="medium"
      disabled={disabled}
      className="top-0 mt-0 w-auto @xl:w-56"
      style={{ marginTop: '0' }}
      variant="secondary"
      onClick={(event) => {
        event.preventDefault();

        if (window.BN && window.BN.add_products_to_quote) {
          window.BN.add_products_to_quote(
            [
              {
                id: parseInt(productId, 10),
                qty: parseInt(quantity ?? '1', 10),
                options: [],
              },
            ],
            true,
            true,
          )
            .then((result: boolean) => {
              if (!result) {
                // Optionally handle failed add to quote (e.g., show error, log)
                console.warn('B2BNinja add to quote failed: invalid product data');
              } else {
                console.log('B2BNinja add to quote successful');
              }
            })
            .catch((err: any) => {
              // Optionally handle error
              console.error('B2BNinja add to quote error:', err);
            });
        }
      }}
    >
      Add To Quote
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
