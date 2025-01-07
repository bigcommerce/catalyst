'use client';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { BcImage } from '~/components/bc-image';

import { saveCartData } from '../_actions/save-cart-data';

export const SaveCart = ({ cartItems, saveCartIcon }: any) => {
  const t = useTranslations('Cart');

  async function saveCartItems() {
    let cartItemsData: any = [];
    if (cartItems?.length > 0) {
      cartItems?.forEach((items: any) => {
        cartItemsData.push({
          variantEntityId: items?.variantEntityId,
          productEntityId: items?.productEntityId,
        });
      });
    }
    if (cartItems?.length > 0) {
      try {
        const { status, error } = await saveCartData(cartItemsData);

        if (status === 'success') {
          toast.success('Successfully added to your list', {
            icon: <Check className="text-success-secondary" />,
          });
        } else {
          toast.error(`${error}`, {
            icon: <Check className="text-error-secondary" />,
          });
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(t('errorMessage'), {
            icon: <Check className="text-error-secondary" />,
          });

          return;
        }
      }
    }
  }

  return (
    <button
      onClick={() => saveCartItems()}
      className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] font-medium"
    >
      <div className="flex items-center space-x-2">
        <BcImage
          alt={t('saveCartWishlist')}
          width={15}
          height={15}
          className="h-[15px] w-[15px]"
          src={saveCartIcon}
        />
        <div className="savecart-wishlist-span text-left text-[1rem] font-normal leading-[2rem] tracking-[0.03125rem] text-[#353535]">
          {t('saveCartWishlist')} <span>{t('saveCartWishlistSpan')}</span>
        </div>
      </div>
    </button>
  );
};
