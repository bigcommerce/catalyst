'use client';

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface CartContext {
  count: number;
  increment: (step?: number) => void;
  decrement: (step?: number) => void;
  setCount: (newCount: number) => void;
}

const CartContext = createContext<CartContext | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [count, setCount] = useState(0);
  const increment = useCallback((step = 1) => setCount((prev) => prev + step), []);
  const decrement = useCallback((step = 1) => setCount((prev) => prev - step), []);

  const value = useMemo(
    () => ({ count, increment, decrement, setCount }),
    [count, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};
