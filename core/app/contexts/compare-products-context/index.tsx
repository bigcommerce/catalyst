'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

export interface CheckedProduct {
  id: number;
  name: string;
  image?: {
    altText?: string;
    url?: string;
  } | null;
}

import { CompareDrawer } from '~/components/compare-drawer';

const CompareProductsContext = createContext<{
  products: CheckedProduct[];
  setProducts: (products: CheckedProduct[]) => void;
} | null>(null);

const isCheckedProducts = (products: unknown): products is CheckedProduct[] => {
  return (
    Array.isArray(products) &&
    products.every((product) => product !== null && typeof product === 'object' && 'id' in product)
  );
};

export const CompareProductsProvider = ({ children }: PropsWithChildren) => {
  const [products, setProducts] = useState<CheckedProduct[]>([]);

  useEffect(() => {
    const stringProducts = sessionStorage.getItem('compareProducts');

    if (stringProducts && stringProducts !== '[]') {
      try {
        const parsedProducts: unknown = JSON.parse(stringProducts);

        if (isCheckedProducts(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch (e) {
        throw new Error('Error parsing compareProducts from sessionStorage');
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('compareProducts', JSON.stringify(products));
  }, [products]);

  return (
    <CompareProductsContext.Provider value={{ products, setProducts }}>
      {children}
      <CompareDrawer />
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
