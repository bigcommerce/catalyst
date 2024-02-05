import { cache } from 'react';

export const customerContext = cache(() => new Map());

export const useCustomerProvider = (customerId?: number) => {
  const global = customerContext();

  if (customerId) {
    global.set('customerId', customerId);
  }

  return global.get('customerId');
};
