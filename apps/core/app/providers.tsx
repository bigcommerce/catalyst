'use client';

import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/components/CompareProductsContext';

export function Providers({ children }: PropsWithChildren) {
  return <CompareProductsProvider>{children}</CompareProductsProvider>;
}
