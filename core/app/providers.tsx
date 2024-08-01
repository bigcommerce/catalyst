'use client';

import { PropsWithChildren } from 'react';

import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

export function Providers({ children }: PropsWithChildren) {
  return <CompareDrawerProvider>{children}</CompareDrawerProvider>;
}
