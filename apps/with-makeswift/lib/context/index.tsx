import { createContext, ReactNode, useContext } from 'react';

import client from '~/client';

export type BcContext = Awaited<ReturnType<typeof getContextData>>;

export const getContextData = async () => {
  const [featuredProducts, bestSellingProducts, categoryTree] = await Promise.all([
    client.getFeaturedProducts(),
    client.getBestSellingProducts(),
    client.getCategoryTree(),
  ]);

  return {
    bestSellingProducts,
    featuredProducts,
    categoryTree,
  };
};

const BcContext = createContext<BcContext | undefined>(undefined);

interface BcContextProviderProps {
  children: ReactNode;
  value: BcContext;
}

export const BcContextProvider = ({ children, value }: BcContextProviderProps) => {
  return <BcContext.Provider value={value}>{children}</BcContext.Provider>;
};

export const useBcContext = () => {
  const bcContext = useContext(BcContext);

  if (!bcContext) {
    throw new Error('useBcContext must be used within a BcContextProvider');
  }

  return bcContext;
};
