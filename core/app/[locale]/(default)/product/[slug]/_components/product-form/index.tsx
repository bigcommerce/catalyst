'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { FragmentOf } from 'gql.tada';
import { AlertCircle, Check, Heart, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { AddToCartButton } from '~/components/add-to-cart-button';
import { useCart } from '~/components/header/cart-provider';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { bodl } from '~/lib/bodl';

import { handleAddToCart } from './_actions/add-to-cart';
import { CheckboxField } from './fields/checkbox-field';
import { DateField } from './fields/date-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { MultipleChoiceField } from './fields/multiple-choice-field';
import { NumberField } from './fields/number-field';
import { QuantityField } from './fields/quantity-field';
import { TextField } from './fields/text-field';
import { ProductFormData, useProductForm } from './use-product-form';

interface Props {
  data: FragmentOf<typeof ProductItemFragment>;
}

const productItemTransform = (p: FragmentOf<typeof ProductItemFragment>) => {
  const category = removeEdgesAndNodes(p.categories).at(0);
  const breadcrumbs = category ? removeEdgesAndNodes(category.breadcrumbs) : [];

  return {
    product_id: p.entityId.toString(),
    product_name: p.name,
    brand_name: p.brand?.name,
    sku: p.sku,
    sale_price: p.prices?.salePrice?.value,
    purchase_price: p.prices?.salePrice?.value || p.prices?.price.value || 0,
    base_price: p.prices?.price.value,
    retail_price: p.prices?.retailPrice?.value,
    currency: p.prices?.price.currencyCode || 'USD',
    category_names: breadcrumbs.map(({ name }) => name),
    variant_id: p.variants.edges?.map((variant) => variant.node.entityId),
  };
};

export const Submit = ({ data: product }: Props) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <AddToCartButton data={product} loading={isSubmitting}>
      <ShoppingCart className="mr-2" />
    </AddToCartButton>
  );
};

export const ProductForm = ({ data: product }: Props) => {
  const t = useTranslations('Product.Form');
  const productOptions = removeEdgesAndNodes(product.productOptions);

  const cart = useCart();
  const { handleSubmit, register, ...methods } = useProductForm();

  const productFormSubmit = async (data: ProductFormData) => {
    const quantity = Number(data.quantity);

    // Optimistic update
    cart.increment(quantity);

    toast.success(
      () => (
        <div className="flex items-center gap-3">
          <span>
            {t.rich('success', {
              cartItems: quantity,
              cartLink: (chunks) => (
                <Link
                  className="font-semibold text-primary hover:text-secondary"
                  href="/cart"
                  prefetch="viewport"
                  prefetchKind="full"
                >
                  {chunks}
                </Link>
              ),
            })}
          </span>
        </div>
      ),
      { icon: <Check className="text-success-secondary" /> },
    );

    const result = await handleAddToCart(data, product);

    if (result.error) {
      toast.error(t('error'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      cart.decrement(quantity);

      return;
    }

    const transformedProduct = productItemTransform(product);

    bodl.cart.productAdded({
      product_value: transformedProduct.purchase_price * quantity,
      currency: transformedProduct.currency,
      line_items: [
        {
          ...transformedProduct,
          quantity,
        },
      ],
    });
  };

  return (
    <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
      <form className="flex flex-col gap-6 @container" onSubmit={handleSubmit(productFormSubmit)}>
        <input type="hidden" value={product.entityId} {...register('product_id')} />

        {productOptions.map((option) => {
          if (option.__typename === 'MultipleChoiceOption') {
            return <MultipleChoiceField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'CheckboxOption') {
            return <CheckboxField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'NumberFieldOption') {
            return <NumberField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'MultiLineTextFieldOption') {
            return <MultiLineTextField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'TextFieldOption') {
            return <TextField key={option.entityId} option={option} />;
          }

          if (option.__typename === 'DateFieldOption') {
            return <DateField key={option.entityId} option={option} />;
          }

          return null;
        })}

        <QuantityField />

        <div className="mt-4 flex flex-col gap-4 @md:flex-row">
          <Submit data={product} />

          {/* NOT IMPLEMENTED YET */}
          <div className="w-full">
            <Button disabled type="submit" variant="secondary">
              <Heart aria-hidden="true" className="mr-2" />
              <span>{t('saveToWishlist')}</span>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
