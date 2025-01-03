'use client';

import { useTranslations } from 'next-intl';
import { FragmentOf } from '~/client/graphql';
import { Button } from '~/components/ui/button';
import { AddToCartButtonFragment } from './fragment';
import { ShoppingCart } from 'lucide-react';
import addToCart from '~/public/add-to-cart/addToCart.svg'
import Image from 'next/image';

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
      className="group relative flex h-[3.5em] w-full items-center justify-center overflow-hidden rounded-[4px] !bg-[#03465c] text-center text-[14px] font-medium uppercase leading-[32px] tracking-[1.25px] text-white transition-all duration-300 hover:bg-[#03465c]/90 disabled:opacity-50"
      disabled={isProductDisabled}
      loading={loading}
      loadingText={t('processing')}
      type="submit"
    >
      {children}
      <span className="transition-transform duration-300 group-hover:-translate-x-2">
        {buttonText()}
      </span>
      <div className="absolute right-0 flex h-full w-0 items-center justify-center bg-[#006380] transition-all duration-300 group-hover:w-[4em]">
        <Image src={addToCart} className='' alt='Add to Cart' unoptimized={true} width={44} height={44} />
      </div>
    </Button>
  );
};

export default AddToCartButton;
