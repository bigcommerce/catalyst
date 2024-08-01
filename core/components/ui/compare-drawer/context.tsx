import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { CompareDrawer } from './compare-drawer';

export interface CheckedProduct {
  id: number;
  name: string;
  image?: {
    altText?: string;
    url?: string;
  } | null;
}

const CompareDrawerContext = createContext<{
  products: CheckedProduct[];
  setProducts: (products: CheckedProduct[]) => void;
} | null>(null);

const isCheckedProducts = (products: unknown): products is CheckedProduct[] => {
  return (
    Array.isArray(products) &&
    products.every((product) => product !== null && typeof product === 'object' && 'id' in product)
  );
};

const CompareDrawerProvider = ({ children }: PropsWithChildren) => {
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
    <CompareDrawerContext.Provider value={{ products, setProducts }}>
      {children}
      <CompareDrawer />
    </CompareDrawerContext.Provider>
  );
};

function useCompareDrawerContext() {
  const context = useContext(CompareDrawerContext);

  if (!context) {
    throw new Error('useCompareDrawerContext must be used within a CompareDrawerProvider');
  }

  return context;
}

export { CompareDrawerProvider, useCompareDrawerContext };
