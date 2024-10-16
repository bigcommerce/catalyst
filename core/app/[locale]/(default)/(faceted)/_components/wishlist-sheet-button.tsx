'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '~/components/ui/button';

import { useWishlistSheetContext } from './wishlist-sheet-context';

interface WishlistSheetButtonProps {
  productId: number;
}

export const WishlistSheetButton = ({ productId }: WishlistSheetButtonProps) => {
  const t = useTranslations('Components.ProductCard.OpenWishlistSheet');

  const { setProductId } = useWishlistSheetContext();

  return (
    <Button
      aria-label={t('open')}
      className="p-3 text-black hover:bg-transparent hover:text-black"
      onClick={() => setProductId(productId)}
      title={t('open')}
      type="button"
      variant="subtle"
    >
      <Heart fill="currentColor" />
    </Button>
  );
};
