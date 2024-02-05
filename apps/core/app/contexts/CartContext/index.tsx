import { cache } from 'react';

export const cartContext = cache(() => new Map());

export const useCartProvider = (cartId?: string) => {
  const global = cartContext();

  if (cartId) {
    global.set('cartId', cartId);
  }

  return global.get('cartId');
};
