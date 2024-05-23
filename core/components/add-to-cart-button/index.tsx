'use client';

import { FragmentOf } from 'gql.tada';
import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';

import { AddToCartButtonFragment } from './fragment';

export const AddToCartButton = ({
  data: product,
  className,
}: {
  data: FragmentOf<typeof AddToCartButtonFragment>;
  className?: string;
}) => {
  const { pending } = useFormStatus();
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
      loading={pending}
      loadingText={t('processing')}
      type="submit"
    >
      {buttonText()}
    </Button>
  );
};
