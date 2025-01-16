import { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react';

import { CompareDrawer } from './compare-drawer';

interface Image {
  altText: string;
  src: string;
}

interface Product {
  id: string;
  name: string;
  image?: Image;
}

const CompareDrawerContext = createContext<{
  products: Product[];
  setProducts: (products: Product[]) => void;
  agentLoginStatus: boolean;
  setAgentLoginStatus: (value: boolean) => void;
  agentRole: string | null; // New context state
  setAgentRole: (value: string | null) => void; // Setter for new context state
} | null>(null);

const isCheckedProducts = (products: unknown): products is Product[] => {
  return (
    Array.isArray(products) &&
    products.every((product) => product !== null && typeof product === 'object' && 'id' in product)
  );
};

const CompareDrawerProvider = ({ children }: PropsWithChildren) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [agentLoginStatus, setAgentLoginStatus] = useState(false); // Initialize with default value
  const [agentRole, setAgentRole] = useState<string | null>(null); // Initialize with default value

  useEffect(() => {
    setAgentLoginStatus(localStorage.getItem('agent_login') === 'true');
    setAgentRole(localStorage.getItem('agent_role'));
  }, []);

  useEffect(() => {
    const stringProducts = sessionStorage.getItem('compareProducts');

    if (stringProducts && stringProducts !== '[]') {
      try {
        const parsedProducts: unknown = JSON.parse(stringProducts);

        if (isCheckedProducts(parsedProducts)) {
          setProducts(parsedProducts);
        }
      } catch {
        throw new Error('Error parsing compareProducts from sessionStorage');
      }
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('compareProducts', JSON.stringify(products));
  }, [products]);
  return (
    <CompareDrawerContext.Provider value={{ products, setProducts, agentLoginStatus, setAgentLoginStatus, agentRole, setAgentRole }}>
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

export { CompareDrawerProvider, useCompareDrawerContext, type Product };
