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
import { ReactNode, useActionState, useCallback, useEffect, useState } from 'react';
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
import { FreeToolSelector } from './free-tool-selector';

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
  inventoryLevel?: { value: number } | null;
  promotions?: any;
  giftProducts?: any;
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
  promotions,
  giftProducts,
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

  // Log form submission for debugging
  const wrappedFormAction = async (formData: FormData) => {
    console.log('🚀 [form] Submitting to cart:', {
      productId: formData.get('id'),
      quantity: formData.get('quantity'),
      freeToolProductId: formData.get('freeToolProductId'),
      freeToolVariantId: formData.get('freeToolVariantId'),
      promoCode: formData.get('promoCode'),
    });

    const result = await formAction(formData);

    console.log('✅ [form] Action completed:', {
      status: result.lastResult?.status,
      hasErrors: !!result.lastResult?.error,
      successMessage: result.successMessage
    });

    return result;
  };

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

  // Free tool selection state
  const [selectedFreeToolId, setSelectedFreeToolId] = useState<number | undefined>();
  const [selectedFreeToolVariantId, setSelectedFreeToolVariantId] = useState<number | undefined>();
  const [selectedPromoCode, setSelectedPromoCode] = useState<string | undefined>();
  const [selectedPromotion, setSelectedPromotion] = useState<any | undefined>();
  const [freeToolError, setFreeToolError] = useState<string | undefined>();

  // Get current quantity from form
  const currentQuantity = Number(quantityControl.value) || 1;

  console.log('🎁 [form] Promotions received:', {
    hasPromotions: !!promotions,
    promotionCount: promotions?.length || 0,
    promotions: promotions,
    currentQuantity
  });

  // Filter promotions based on quantity and rules
  const eligiblePromotions = promotions?.filter((promo: any) => {
    const isEligible = currentQuantity >= promo.minimumQuantity;
    console.log('🎁 [form] Checking promo eligibility:', {
      promoId: promo.id,
      promoName: promo.name,
      minimumQuantity: promo.minimumQuantity,
      currentQuantity,
      isEligible
    });
    return isEligible;
  }) || [];

  console.log('🎁 [form] Eligible promotions:', eligiblePromotions.length, eligiblePromotions);

  // Calculate how many free gifts user can select
  const maxFreeGiftsAllowed = eligiblePromotions.reduce((total: number, promo: any) => {
    if (promo.applyOnce) {
      // Can only get 1 gift regardless of quantity
      return total + 1;
    } else {
      // Can get multiple gifts based on how many times they meet minimum
      const timesQualified = Math.floor(currentQuantity / promo.minimumQuantity);
      return total + timesQualified;
    }
  }, 0);

  console.log('🎁 [form] Max free gifts allowed:', maxFreeGiftsAllowed);

  // Prepare free tool options from eligible promotions only
  const freeToolOptions =
    eligiblePromotions && giftProducts && eligiblePromotions.length > 0
      ? eligiblePromotions.flatMap((promo: any) =>
          promo.giftItems.map((giftItem: any) => {
            const giftProduct = giftProducts.find((p: any) => p.entityId === giftItem.productId);

            if (!giftProduct) return null;

            // If variant-specific gift
            if (giftItem.variantId && giftProduct.variants) {
              const variant = giftProduct.variants.find((v: any) => v.entityId === giftItem.variantId);

              return {
                productId: giftProduct.entityId,
                variantId: giftItem.variantId,
                name: `${giftProduct.name}${variant?.optionLabel ? ` - ${variant.optionLabel}` : ''}`,
                imageUrl: variant?.imageUrl || giftProduct.imageUrl,
                promoCode: promo.promoCode, // Include promo code
              };
            }

            // Product-level gift
            return {
              productId: giftProduct.entityId,
              name: giftProduct.name,
              imageUrl: giftProduct.imageUrl,
              promoCode: promo.promoCode, // Include promo code
            };
          }).filter(Boolean),
        )
      : [];

  const handleFreeToolSelect = (productId: number, variantId?: number) => {
    setSelectedFreeToolId(productId);
    setSelectedFreeToolVariantId(variantId);

    // Find the selected tool to get its promo code and promotion details
    const selectedTool = freeToolOptions.find((tool: any) =>
      tool.productId === productId &&
      (variantId === undefined || tool.variantId === variantId)
    );

    if (selectedTool?.promoCode) {
      setSelectedPromoCode(selectedTool.promoCode);
      console.log('🎟️ [form] Promo code selected:', selectedTool.promoCode);
    }

    // Find the promotion associated with this tool
    const promo = eligiblePromotions.find((p: any) =>
      p.giftItems.some((item: any) =>
        item.productId === productId &&
        (!item.variantId || item.variantId === variantId)
      )
    );
    setSelectedPromotion(promo);
    console.log('🎁 [form] Promotion selected:', promo);

    setFreeToolError(undefined);
  };

  // Calculate free tool quantity based on promotion rules and current quantity
  const freeToolQuantity = selectedPromotion
    ? selectedPromotion.applyOnce
      ? 1  // Only 1 gift regardless of quantity
      : Math.floor(currentQuantity / selectedPromotion.minimumQuantity)  // Multiple gifts
    : 0;

  console.log('🎁 [form] Free tool quantity calculated:', {
    selectedPromotion: selectedPromotion?.name,
    applyOnce: selectedPromotion?.applyOnce,
    currentQuantity,
    minimumQuantity: selectedPromotion?.minimumQuantity,
    freeToolQuantity
  });

  // Reset free tool selection if quantity changes and user no longer qualifies
  useEffect(() => {
    if (selectedFreeToolId && freeToolOptions.length === 0) {
      setSelectedFreeToolId(undefined);
      setSelectedFreeToolVariantId(undefined);
      setSelectedPromoCode(undefined);
      setSelectedPromotion(undefined);
      toast.info('Free gift removed - increase quantity to qualify');
    }
  }, [freeToolOptions.length, selectedFreeToolId]);

  const hasFreeToolPromotion = freeToolOptions.length > 0;

  return (
    <FormProvider context={form.context}>
      <FormStateInput />
      <form {...getFormProps(form)} action={formAction} className="py-8">
        <input name="id" type="hidden" value={productId} />
        <input name="action" type="hidden" value="add" />
        {selectedFreeToolId && (
          <input name="freeToolProductId" type="hidden" value={selectedFreeToolId} />
        )}
        {selectedFreeToolVariantId && (
          <input name="freeToolVariantId" type="hidden" value={selectedFreeToolVariantId} />
        )}
        {freeToolQuantity > 0 && (
          <input name="freeToolQuantity" type="hidden" value={freeToolQuantity} />
        )}
        {selectedPromoCode && (
          <input name="promoCode" type="hidden" value={selectedPromoCode} />
        )}

        <div className="space-y-6">
          {hasFreeToolPromotion && (
            <FreeToolSelector
              tools={freeToolOptions}
              onSelect={handleFreeToolSelect}
              selectedToolId={selectedFreeToolId}
              error={freeToolError}
              promotionName={eligiblePromotions[0]?.displayName}
            />
          )}
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
            <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-8 sm:gap-3">
              {/* Quantity input: full width on mobile, 3/8 on desktop */}
              <div className="col-span-1 w-full sm:col-span-2">
                <NumberInput
                  aria-label={quantityLabel}
                  buttonClassName="w-full"
                  className="w-full"
                  decrementLabel={decrementLabel}
                  incrementLabel={incrementLabel}
                  max={9999}
                  min={1}
                  name={formFields.quantity.name}
                  onBlur={quantityControl.blur}
                  onChange={(e) => {
                    const valueToChangeTo = e.currentTarget.value;
                    const currentInventory = parseInt(inventoryLevel?.value, 10);
                    const requestedQty = Number(valueToChangeTo);

                    // Check if we have enough inventory (for in-stock items only)
                    if (currentInventory > 0 && currentInventory < requestedQty) {
                      toast.error(
                        `Only ${currentInventory} units available in stock. You can order more for backorder.`,
                      );
                    }

                    // Always allow the change (backorders are allowed)
                    quantityControl.change(valueToChangeTo);
                  }}
                  onFocus={quantityControl.focus}
                  required
                  value={quantityControl.value}
                />
              </div>
              {/* Buttons: stacked and full width on mobile, side by side on desktop */}
              <div className="col-span-1 flex w-full flex-col gap-3 sm:col-span-6 sm:flex-row">
                <SubmitButton disabled={ctaDisabled}>{ctaLabel}</SubmitButton>
                <BuyNowButton productId={productId} quantity={quantityControl.value} />
              </div>
            </div>
          </div>
          <p className="pt-2 text-sm text-gray-500">
            Buying in bulk?{' '}
            <a className="underline hover:text-gray-700" href="/contact">
              Contact us for a quote
            </a>
          </p>
        </div>
      </form>
    </FormProvider>
  );
}

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button
      className="w-auto @xl:w-56"
      disabled={disabled}
      loading={pending}
      size="medium"
      type="submit"
      variant="secondary"
    >
      {children}
    </Button>
  );
}

function BuyNowButton({ productId, quantity }: { productId: string; quantity?: string }) {
  const [loading, setLoading] = useState(false);

  const handleBuyNow = () => {
    setLoading(true);
    const qty = Math.max(1, Number(quantity ?? '1'));

    window.location.href = `/api/buy-now?product_id=${encodeURIComponent(productId)}&quantity=${qty}`;
  };

  return (
    <Button
      className="w-auto @xl:w-56"
      loading={loading}
      onClick={handleBuyNow}
      size="medium"
      type="button"
      variant="primary"
    >
      Buy Now
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
