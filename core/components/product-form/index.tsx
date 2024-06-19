'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { AlertCircle, Check, Heart, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { Wishlists } from '~/app/[locale]/(default)/product/[slug]/_components/details';
import { FragmentOf } from '~/client/graphql';

import { WishlistSheet } from '../../app/[locale]/(default)/account/[tab]/_components/wishlist-sheet';
import { AddToCartButton } from '../add-to-cart-button';
import { Link } from '../link';
import { Button } from '../ui/button';

import { handleAddToCart } from './_actions/add-to-cart';
import { CheckboxField } from './fields/checkbox-field';
import { DateField } from './fields/date-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { MultipleChoiceField } from './fields/multiple-choice-field';
import { NumberField } from './fields/number-field';
import { QuantityField } from './fields/quantity-field';
import { TextField } from './fields/text-field';
import { ProductFormFragment } from './fragment';
import { ProductFormData, useProductForm } from './use-product-form';

interface SubmitProps {
  data: FragmentOf<typeof ProductFormFragment>;
}

interface ProductFormProps {
  data: FragmentOf<typeof ProductFormFragment>;
  isLogged?: boolean;
  wishlists?: Wishlists;
}

export const Submit = ({ data: product }: SubmitProps) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <AddToCartButton data={product} loading={isSubmitting}>
      <ShoppingCart className="mr-2" />
    </AddToCartButton>
  );
};

export const ProductForm = ({ data: product, isLogged, wishlists }: ProductFormProps) => {
  const t = useTranslations('AddToCart');
  const productOptions = removeEdgesAndNodes(product.productOptions);

  const { handleSubmit, register, ...methods } = useProductForm();

  const productFormSubmit = async (data: ProductFormData) => {
    const result = await handleAddToCart(data, product);
    const quantity = Number(data.quantity);

    if (result.error) {
      toast.error(t('errorAddingProductToCart'), {
        icon: <AlertCircle className="text-error-secondary" />,
      });

      return;
    }

    toast.success(
      () => (
        <div className="flex items-center gap-3">
          <span>
            {t.rich('addedProductQuantity', {
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
          {isLogged && wishlists ? (
            <WishlistSheet productId={product.entityId} wishlistsData={wishlists} />
          ) : (
            <Button asChild type="button" variant="secondary">
              <Link href="/login">
                <Heart aria-hidden="true" className="mr-2" />
                <span>{t('saveToWishlist')}</span>
              </Link>
            </Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
};
