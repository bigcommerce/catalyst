'use client';

import { PropsWithChildren } from 'react';

import { Toaster } from '@/ui/primitives/toaster';

export function Providers({ children }: PropsWithChildren) {
  return (
    <>
      <Toaster position="top-right" />
      {children}
    </>
  );
}
