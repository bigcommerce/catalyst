'use client';

import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/app/contexts/compare-products-context';

export function Providers({ children }: PropsWithChildren) {
  return <CompareProductsProvider>{children}</CompareProductsProvider>;
}
