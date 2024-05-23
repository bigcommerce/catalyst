'use client';

import { FragmentOf } from 'gql.tada';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useFormContext } from 'react-hook-form';

import { AddToCartButtonFragment } from '../add-to-cart-button/fragment';
import { Button } from '../ui/button';

export const AddToCartButton = ({
  data: product,
  className,
}: {
  data: FragmentOf<typeof AddToCartButtonFragment>;
  className?: string;
}) => {
  const t = useTranslations('AddToCart');

  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  const isProductDisabled =
    product.availabilityV2.status === 'Unavailable' || !product.inventory.isInStock;

  const buttonText = () => {
    if (product.availabilityV2.status === 'Unavailable') {
      return t('unaviailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('preorder');
    }

    if (!product.inventory.isInStock) {
      return t('outOfStock');
    }

    return t('addToCart');
  };

  return (
    <Button
      className={className}
      disabled={isProductDisabled}
      loading={isSubmitting}
      loadingText={t('processing')}
      type="submit"
    >
      <ShoppingCart aria-hidden="true" className="mx-2" />
      {buttonText()}
    </Button>
  );
};
