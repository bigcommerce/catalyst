'use client';

import { PropsWithChildren } from 'react';

import { CompareProductsProvider } from '~/app/contexts/compare-products-context';
import { AnalyticsProvider } from '~/app/contexts/analytics-context';

export function Providers({ children }: PropsWithChildren) {
  return (
    <AnalyticsProvider>
      <CompareProductsProvider>{children}</CompareProductsProvider>
    </AnalyticsProvider>
  );
}
