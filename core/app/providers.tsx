'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SearchProvider>
      <Toaster position="top-right" />
      {children}
    </SearchProvider>
  );
}
