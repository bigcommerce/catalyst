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
      id="add-to-cart"
      className="rounded-[4px] 
  uppercase 
  relative 
  px-[30px] 
  py-[15px] 
  !bg-[#03465c] 
  text-white 
  text-[14px] 
  font-medium 
  transition-colors 
  duration-300 
  ease-in-out"
      disabled={isProductDisabled}
      loading={loading}
      loadingText={t('processing')}
      type="submit"
    >
      {children}
      {buttonText()}
    </Button>
  );
};

export default AddToCartButton;