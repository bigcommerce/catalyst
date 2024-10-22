'use client';

import { PropsWithChildren } from 'react';

import { CartProvider } from '~/components/header/cart-provider';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

import { AccountStatusProvider } from './[locale]/(default)/account/(tabs)/_components/account-status-provider';
import { CommonProvider } from '~/components/common-context/common-provider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <CommonProvider>
      <CartProvider>
        <AccountStatusProvider>
          <CompareDrawerProvider>{children}</CompareDrawerProvider>
        </AccountStatusProvider>
      </CartProvider>
    </CommonProvider>
  );
}
