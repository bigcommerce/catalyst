'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster position="top-right" />
      <CartProvider>
        <CompareDrawerProvider>{children}</CompareDrawerProvider>
      </CartProvider>
    </>
  );
}
