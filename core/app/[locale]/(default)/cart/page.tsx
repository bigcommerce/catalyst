import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { CartSkeleton } from '@/vibes/soul/components/cart';

import { Cart as CartComponent } from './_components/cart';

export async function generateMetadata() {
  const t = await getTranslations('Cart');

  return {
    title: t('title'),
  };
}

export default function Cart() {
  return (
    <Suspense fallback={<CartSkeleton />}>
      <CartComponent />
    </Suspense>
  );
}

export const runtime = 'edge';
