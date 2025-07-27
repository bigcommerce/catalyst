'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { CartProvider } from '~/components/header/cart-provider';
import { QuoteNinjaCustomerSync } from '~/components/QuoteNinjaCustomerSync';

interface ProvidersProps extends PropsWithChildren {
  customer?: any;
}

export function Providers({ children, customer }: ProvidersProps) {
  return (
    <>
      <Toaster position="top-right" />
      {customer && <QuoteNinjaCustomerSync customer={customer} />}
      <CartProvider>{children}</CartProvider>
    </>
  );
}
