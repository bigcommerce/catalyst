'use client';

import { PropsWithChildren } from 'react';

import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

import { AccountStatusProvider } from './[locale]/(default)/account/(tabs)/_components/account-status-provider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <CartProvider>
      <AccountStatusProvider>
        <CompareDrawerProvider>{children}</CompareDrawerProvider>
      </AccountStatusProvider>
    </CartProvider>
  );
}
