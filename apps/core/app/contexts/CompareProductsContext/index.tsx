'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

const CompareProductsContext = createContext<{
  productIds: string[];
  setProductIds: (productIds: string[]) => void;
} | null>(null);

export const CompareProductsProvider = ({ children }: PropsWithChildren) => {
  const [productIds, setProductIds] = useState<string[]>([]);

  useEffect(() => {
    const ids = sessionStorage.getItem('compareProductIds');

    if (ids) {
      setProductIds(ids.split(','));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('compareProductIds', productIds.join(','));
  }, [productIds]);

  return (
    <CompareProductsContext.Provider value={{ productIds, setProductIds }}>
      {children}
    </CompareProductsContext.Provider>
  );
};

export function useCompareProductsContext() {
  const context = useContext(CompareProductsContext);

  if (!context) {
    throw new Error('useCompareProductsContext must be used within a CompareProductsProvider');
  }

  return context;
}
