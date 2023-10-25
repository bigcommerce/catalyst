'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

type CheckedProductIds = Record<string, boolean>;

const CompareProductsContext = createContext<{
  productIds: CheckedProductIds;
  setProductIds: (productIds: CheckedProductIds) => void;
} | null>(null);

const isCheckeredProductIds = (ids: object): ids is CheckedProductIds => {
  return Object.values(ids).every((value) => typeof value === 'boolean');
};

export const CompareProductsProvider = ({ children }: PropsWithChildren) => {
  const [productIds, setProductIds] = useState<CheckedProductIds>({});

  useEffect(() => {
    const ids = sessionStorage.getItem('compareProductIds');

    if (ids && ids !== '{}') {
      try {
        const parsedIds: unknown = JSON.parse(ids);

        if (
          parsedIds !== null &&
          typeof parsedIds === 'object' &&
          isCheckeredProductIds(parsedIds)
        ) {
          setProductIds(parsedIds);
        }
      } catch (e) {
        throw new Error('Error parsing compareProductIds from sessionStorage');
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('compareProductIds', JSON.stringify(productIds));
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
