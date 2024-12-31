import { useTranslations } from 'next-intl';

import { CartSkeleton } from '@/vibes/soul/sections/cart';

export default function Loading() {
  const t = useTranslations('Cart');

  return <CartSkeleton title={t('title')} />;
}
