'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

export const WishlistSheetContext = createContext<{
  productId: number | null;
  setProductId: Dispatch<SetStateAction<number | null>>;
} | null>(null);

export const WishlistSheetProvider = ({ children }: { children: ReactNode }) => {
  const [productId, setProductId] = useState<number | null>(null);

  return (
    <WishlistSheetContext.Provider value={{ productId, setProductId }}>
      {children}
    </WishlistSheetContext.Provider>
  );
};

export function useWishlistSheetContext() {
  const context = useContext(WishlistSheetContext);

  if (!context) {
    throw new Error('useWishlistSheetContext must be used within a WishlistSheetProvider');
  }

  return context;
}
