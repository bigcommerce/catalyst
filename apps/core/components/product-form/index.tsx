'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { AlertCircle, Check, Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider } from 'react-hook-form';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';

import { Link } from '../link';

import { handleAddToCart } from './_actions/add-to-cart';
import { AddToCart } from './add-to-cart';
import { CheckboxField } from './fields/checkbox-field';
import { DateField } from './fields/date-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { MultipleChoiceField } from './fields/multiple-choice-field';
import { NumberField } from './fields/number-field';
import { QuantityField } from './fields/quantity-field';
import { TextField } from './fields/text-field';
import { ProductFormFragment } from './fragment';
import { ProductFormData, useProductForm } from './use-product-form';

interface Props {
  product: FragmentOf<typeof ProductFormFragment>;
}

export const ProductForm = ({ product }: Props) => {
  const t = useTranslations('Product.Form');
  const productOptions = removeEdgesAndNodes(product.productOptions);

  const { handleSubmit, register, ...methods } = useProductForm();

  const productFormSubmit = async (data: ProductFormData) => {
    const result = await handleAddToCart(data);
    const quantity = Number(data.quantity);

    if (result.error) {
      toast.error(result.error || t('errorMessage'), {
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
          <AddToCart disabled={product.availabilityV2.status === 'Unavailable'} />

          {/* NOT IMPLEMENTED YET */}
          <div className="w-full">
            <Button disabled type="submit" variant="secondary">
              <Heart aria-hidden="true" className="mx-2" />
              <span>{t('saveToWishlist')}</span>
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  );
};
