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
import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { createSerializer, parseAsString, useQueryStates } from 'nuqs';
import { ReactNode, startTransition, useActionState, useCallback, useEffect, useMemo } from 'react';
import { useFormStatus } from 'react-dom';
import { z } from 'zod';

import { ButtonRadioGroup } from '@/vibes/soul/form/button-radio-group';
import { CardRadioGroup } from '@/vibes/soul/form/card-radio-group';
import { Checkbox } from '@/vibes/soul/form/checkbox';
import { DatePicker } from '@/vibes/soul/form/date-picker';
import { FormStatus } from '@/vibes/soul/form/form-status';
import { Input } from '@/vibes/soul/form/input';
import { NumberInput } from '@/vibes/soul/form/number-input';
import { RadioGroup } from '@/vibes/soul/form/radio-group';
import { SelectField } from '@/vibes/soul/form/select-field';
import { SwatchRadioGroup } from '@/vibes/soul/form/swatch-radio-group';
import { Textarea } from '@/vibes/soul/form/textarea';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { useEvents } from '~/components/analytics/events';
import { usePathname, useRouter } from '~/i18n/routing';

import { revalidateCart } from './actions/revalidate-cart';
import { Field, schema, SchemaRawShape } from './schema';

type Action<S, P> = (state: Awaited<S>, payload: P) => S | Promise<S>;

interface State<F extends Field> {
  fields: F[];
  lastResult: SubmissionResult | null;
  successMessage?: ReactNode;
}

export type ProductDetailFormAction<F extends Field> = Action<State<F>, FormData>;

export interface StockDisplayData {
  stockLevelMessage?: string | null;
  backorderAvailabilityPrompt?: string | null;
}

export interface BackorderDisplayData {
  availableOnHand: number;
  availableForBackorder: number;
  unlimitedBackorder: boolean;
  showQuantityOnBackorder: boolean;
  backorderMessage: string | null;
}

export interface ProductDetailFormProps<F extends Field> {
  fields: F[];
  action: ProductDetailFormAction<F>;
  productId: string;
  ctaLabel?: string;
  quantityLabel?: string;
  incrementLabel?: string;
  decrementLabel?: string;
  emptySelectPlaceholder?: string;
  ctaDisabled?: boolean;
  prefetch?: boolean;
  additionalActions?: ReactNode;
  minQuantity?: number;
  maxQuantity?: number;
  stockDisplayData?: StockDisplayData;
  backorderDisplayData?: BackorderDisplayData;
}

export function ProductDetailForm<F extends Field>({
  action,
  fields,
  productId,
  ctaLabel = 'Add to cart',
  quantityLabel = 'Quantity',
  incrementLabel = 'Increase quantity',
  decrementLabel = 'Decrease quantity',
  emptySelectPlaceholder = 'Select an option',
  ctaDisabled = false,
  prefetch = false,
  additionalActions,
  minQuantity,
  maxQuantity,
  stockDisplayData,
  backorderDisplayData,
}: ProductDetailFormProps<F>) {
  const router = useRouter();
  const pathname = usePathname();
  const events = useEvents();
  const t = useTranslations('Product.ProductDetails');

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
      [field.name]: params[field.name] ?? field.defaultValue,
    }),
    { quantity: minQuantity ?? 1 },
  );

  const [{ lastResult, successMessage }, formAction] = useActionState(action, {
    fields,
    lastResult: null,
  });

  useEffect(() => {
    if (lastResult?.status === 'success') {
      toast.success(successMessage);

      startTransition(async () => {
        // This is needed to refresh the Data Cache after the product has been added to the cart.
        // The cart id is not picked up after the first time the cart is created/updated.
        await revalidateCart();
      });
    }
  }, [lastResult, successMessage, router]);

  const [form, formFields] = useForm({
    lastResult,
    constraint: getZodConstraint(schema(fields, minQuantity, maxQuantity)),
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: schema(fields, minQuantity, maxQuantity) });
    },
    onSubmit(event, { formData }) {
      event.preventDefault();

      startTransition(() => {
        formAction(formData);

        events.onAddToCart?.(formData);
      });
    },
    // @ts-expect-error: `defaultValue` types are conflicting with `onValidate`.
    defaultValue,
    shouldValidate: 'onSubmit',
    shouldRevalidate: 'onInput',
  });

  const backorderMessages = useMemo(() => {
    const {
      availableForBackorder,
      availableOnHand,
      backorderMessage,
      showQuantityOnBackorder,
      unlimitedBackorder,
    } = backorderDisplayData || { availableForBackorder: 0, availableOnHand: 0 };

    if (!showQuantityOnBackorder && !backorderMessage) {
      return undefined;
    }

    const orderQuantity = Number(formFields.quantity.value);

    if (Number.isNaN(orderQuantity) || orderQuantity <= availableOnHand) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: undefined,
      };
    }

    if (!showQuantityOnBackorder) {
      return {
        backorderQuantityMessage: undefined,
        backorderInfoMessage: backorderMessage ?? undefined,
      };
    }

    return {
      backorderQuantityMessage: t('backorderQuantity', {
        quantity: unlimitedBackorder
          ? orderQuantity - availableOnHand
          : Math.min(orderQuantity - availableOnHand, availableForBackorder),
      }),
      backorderInfoMessage: backorderMessage ?? undefined,
    };
  }, [backorderDisplayData, formFields.quantity.value, t]);

  const quantityControl = useInputControl(formFields.quantity);

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction}>
        <input name="id" type="hidden" value={productId} />
        <div className="space-y-6 pb-8">
          {fields.map((field) => {
            return (
              <FormField
                emptySelectPlaceholder={emptySelectPlaceholder}
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

          <div className="h-[3.2rem] sm:h-[2.6rem]">
            {!!stockDisplayData?.stockLevelMessage && (
              <div
                className={clsx(
                  'flex flex-wrap justify-start gap-x-2.5 gap-y-2 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]',
                  'transition-transform duration-200 ease-in-out',
                  backorderMessages?.backorderQuantityMessage ||
                    backorderMessages?.backorderInfoMessage
                    ? 'translate-y-0'
                    : 'translate-y-[calc(100%+4px)]',
                )}
              >
                <div className="flex-none whitespace-nowrap font-semibold text-black">
                  {stockDisplayData.stockLevelMessage}
                </div>
                {!!stockDisplayData.backorderAvailabilityPrompt && (
                  <div className="flex-none whitespace-nowrap border-s border-gray-300 pl-2.5">
                    {stockDisplayData.backorderAvailabilityPrompt}
                  </div>
                )}
              </div>
            )}
            {!!backorderMessages && (
              <div
                className={clsx(
                  'mt-1 flex flex-wrap justify-start gap-x-2.5 gap-y-2 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]',
                  'ease-initial transition-opacity',
                  backorderMessages.backorderQuantityMessage ||
                    backorderMessages.backorderInfoMessage
                    ? 'duration-400 opacity-100'
                    : 'opacity-0 delay-0 duration-100',
                )}
              >
                <div className="flex-none whitespace-nowrap font-semibold text-black">
                  {backorderMessages.backorderQuantityMessage}
                </div>
                {!!backorderMessages.backorderInfoMessage && (
                  <div className="flex-none whitespace-nowrap border-s border-gray-300 pl-2.5">
                    {backorderMessages.backorderInfoMessage}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-x-3">
            <NumberInput
              aria-label={quantityLabel}
              decrementLabel={decrementLabel}
              incrementLabel={incrementLabel}
              max={maxQuantity}
              min={minQuantity ?? 1}
              name={formFields.quantity.name}
              onBlur={quantityControl.blur}
              onChange={(e) => quantityControl.change(e.currentTarget.value)}
              onFocus={quantityControl.focus}
              required
              value={quantityControl.value}
            />
            <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
            {additionalActions}
          </div>
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({ children, disabled }: { children: ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-auto @xl:w-56"
      disabled={disabled}
      loading={pending}
      size="medium"
      type="submit"
    >
      {children}
    </Button>
  );
}

// eslint-disable-next-line complexity
function FormField({
  field,
  formField,
  onPrefetch,
  emptySelectPlaceholder,
}: {
  field: Field;
  formField: FieldMetadata<string | number | boolean | Date | undefined>;
  onPrefetch: (fieldName: string, value: string) => void;
  emptySelectPlaceholder?: string;
}) {
  const controls = useInputControl(formField);

  const [params, setParams] = useQueryStates(
    field.persist === true ? { [field.name]: parseAsString.withOptions({ shallow: false }) } : {},
  );

  const handleChange = useCallback(
    (value: string) => {
      // Ensure that if page is reached without a full reload, we are still setting the selection properly based on query params.
      const fieldValue = value || params[field.name];

      void setParams({ [field.name]: fieldValue || null }); // Passing `null` to remove the value from the query params if fieldValue is falsey

      controls.change(fieldValue ?? ''); // If fieldValue is falsey, we set it to an empty string
    },
    [setParams, field, controls, params],
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

    case 'date':
      return (
        <DatePicker
          defaultValue={controls.value}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onChange={(e) => handleChange(e.currentTarget.value)}
          onFocus={controls.focus}
          required={formField.required}
        />
      );

    case 'textarea':
      return (
        <Textarea
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          maxLength={field.maxLength}
          minLength={field.minLength}
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
          checked={controls.value === 'true'}
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onCheckedChange={(value) => handleChange(value ? 'true' : '')}
          onFocus={controls.focus}
          required={formField.required}
          value={controls.value ?? ''}
        />
      );

    case 'select':
      return (
        <SelectField
          errors={formField.errors}
          key={formField.id}
          label={field.label}
          name={formField.name}
          onBlur={controls.blur}
          onFocus={controls.focus}
          onOptionMouseEnter={handleOnOptionMouseEnter}
          onValueChange={handleChange}
          options={field.options}
          placeholder={emptySelectPlaceholder}
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
