'use client';

import { useTranslations } from 'next-intl';

import { FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';

import { AddToCartButtonFragment } from './fragment';

export const AddToCartButton = ({
  children,
  data: product,
  className,
  loading = false,
}: {
  children?: React.ReactNode;
  data: FragmentOf<typeof AddToCartButtonFragment>;
  className?: string;
  loading?: boolean;
}) => {
  const t = useTranslations('Components.AddToCartButton');

  const noParentOrVariantStock =
    !product.inventory.isInStock ||
    !product.inventory.hasVariantInventory ||
    product.availabilityV2.status === 'Unavailable';

  const buttonText = () => {
    if (product.availabilityV2.status === 'Unavailable') {
      return t('unavailable');
    }

    if (product.availabilityV2.status === 'Preorder') {
      return t('preorder');
    }

    if (noParentOrVariantStock) {
      return t('outOfStock');
    }

    return t('addToCart');
  };

  return (
    <Button
      className={className}
      disabled={noParentOrVariantStock}
      loading={loading}
      loadingText={t('processing')}
      type="submit"
    >
      {children}
      {buttonText()}
    </Button>
  );
};
