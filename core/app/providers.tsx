'use client';

import { PropsWithChildren } from 'react';

import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

import { WishlistSheetProvider } from './[locale]/(default)/(faceted)/_components/wishlist-sheet-context';
import { AccountStatusProvider } from './[locale]/(default)/account/(tabs)/_components/account-status-provider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <WishlistSheetProvider>
      <AccountStatusProvider>
        <CompareDrawerProvider>{children}</CompareDrawerProvider>
      </AccountStatusProvider>
    </WishlistSheetProvider>
  );
}
