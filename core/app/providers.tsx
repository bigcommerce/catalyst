'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/vibes/soul/primitives/toaster';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
