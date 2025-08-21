'use client';

import { B2BRole } from './types';
import { useSDK } from './use-b2b-sdk';

export const useB2bShoppingListEnabled = (): boolean => {
  const sdk = useSDK();

  const quoteConfigs = sdk?.utils?.quote?.getQuoteConfigs();
  const role = sdk?.utils?.user.getProfile().role;

  if (!quoteConfigs || role === undefined) {
    return false;
  }

  const shoppingListConfig = quoteConfigs.find(
    ({ key }) => key === 'shopping_list_on_product_page',
  );

  if (shoppingListConfig?.value !== '1') {
    return false;
  }

  if (role === B2BRole.GUEST) {
    return Boolean(shoppingListConfig.extraFields.guest);
  }

  if (role === B2BRole.B2C) {
    return Boolean(shoppingListConfig.extraFields.b2c);
  }

  return Boolean(shoppingListConfig.extraFields.b2b);
};
