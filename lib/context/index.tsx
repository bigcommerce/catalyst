import { createContext, ReactNode, useContext } from 'react';

import { getBestSellingProducts, getCategoryTree, getFeaturedProducts } from '@client';

export type BcContext = Awaited<ReturnType<typeof getContextData>>;

export const getContextData = async () => {
  const [featuredProducts, popularProducts, categoryTree] = await Promise.all([
    getFeaturedProducts(),
    getBestSellingProducts(),
    getCategoryTree(),
  ]);

  return {
    featuredProducts,
    popularProducts,
    categoryTree,
  };
};

const BcContext = createContext<BcContext | undefined>(undefined);

export const BcContextProvider = ({
  children,
  value,
}: {
  children: ReactNode;
  value: BcContext;
}) => {
  return <BcContext.Provider value={value}>{children}</BcContext.Provider>;
};

export const useBcContext = () => {
  const bcContext = useContext(BcContext);

  if (!bcContext) {
    throw new Error('useBcContext must be used within a BcContextProvider');
  }

  return bcContext;
};
