'use client';

import { PropsWithChildren } from 'react';

import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

export function Providers({ children }: PropsWithChildren) {
  return (
    <CartProvider>
      <CompareDrawerProvider>{children}</CompareDrawerProvider>
    </CartProvider>
  );
}
