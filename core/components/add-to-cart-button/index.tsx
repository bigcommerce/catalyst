'use client';

import { FragmentOf } from 'gql.tada';
import { ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '~/components/ui/button';

import { AddToCartButtonFragment } from './fragment';

export const AddToCartButton = ({
  data: product,
  className,
  loading = false,
  showCartIcon = false,
}: {
  data: FragmentOf<typeof AddToCartButtonFragment>;
  className?: string;
  loading?: boolean;
  showCartIcon?: boolean;
}) => {
  const t = useTranslations('AddToCart');

  const isProductDisabled =
    product.availabilityV2.status === 'Unavailable' || !product.inventory.isInStock;

  const buttonText = () => {
    if (product.availabilityV2.status === 'Unavailable') {
      return t('unavailable');
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
      loading={loading}
      loadingText={t('processing')}
      type="submit"
    >
      {showCartIcon && <ShoppingCart className="mr-2" />}
      {buttonText()}
    </Button>
  );
};
