'use client';

import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/app/contexts/CompareProductsContext';

export function Providers({ children }: PropsWithChildren) {
  return <CompareProductsProvider>{children}</CompareProductsProvider>;
}
