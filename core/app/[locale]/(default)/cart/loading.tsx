import { useTranslations } from 'next-intl';

import { CartSkeleton } from '@/ui/sections/cart';

export default function Loading() {
  const t = useTranslations('Cart');

  return <CartSkeleton title={t('title')} />;
}
