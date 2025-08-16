'use client';

import { SessionProvider } from 'next-auth/react';
import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';
import { SearchProvider } from '~/lib/search';

export function Providers({ children }: PropsWithChildren) {
  return (
    <SessionProvider>
      <SearchProvider>
        <Toaster position="top-right" />
        {children}
      </SearchProvider>
    </SessionProvider>
  );
}
