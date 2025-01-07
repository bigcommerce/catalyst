'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { CompareDrawerProvider } from '~/components/ui/compare-drawer';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster position="top-right" />
      <CompareDrawerProvider>{children}</CompareDrawerProvider>
    </>
  );
}
