'use client';

import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/app/contexts/compare-products-context';
import { BodlProvider } from '~/app/contexts/bodl-context';

export function Providers({ children }: PropsWithChildren) {
  return (
    <BodlProvider>
      <CompareProductsProvider>{children}</CompareProductsProvider>
    </BodlProvider>
  );
}
