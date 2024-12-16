'use client';

import { createContext, startTransition, useTransition } from 'react';

export const ProductListTransitionContext = createContext<ReturnType<typeof useTransition>>([
  false,
  startTransition,
]);

export function ProductListTransitionProvider({ children }: { children: React.ReactNode }) {
  return (
    <ProductListTransitionContext.Provider value={useTransition()}>
      {children}
    </ProductListTransitionContext.Provider>
  );
}
