'use client';

import { useEffect, useState } from 'react';

import { B2BRole } from './types';
import { useSDK } from './use-b2b-sdk';

export const useB2bShoppingListEnabled = () => {
  const [isAddToShoppingListEnabled, setIsAddToShoppingListEnabled] = useState(false);
  const sdk = useSDK();

  useEffect(() => {
    const quoteConfigs = sdk?.utils?.quote?.getQuoteConfigs();
    const role = sdk?.utils?.user.getProfile().role;

    // eslint-disable-next-line no-restricted-globals
    if (!quoteConfigs || isNaN(Number(role))) {
      return;
    }

    const shoppingListConfig = quoteConfigs.find(
      ({ key }) => key === 'shopping_list_on_product_page',
    );

    if (shoppingListConfig?.value !== '1') {
      return;
    }

    if (role === B2BRole.GUEST && shoppingListConfig.extraFields.guest) {
      setIsAddToShoppingListEnabled(true);
    }

    if (role === B2BRole.B2C && shoppingListConfig.extraFields.b2c) {
      setIsAddToShoppingListEnabled(true);
    }

    if (
      ![B2BRole.B2C, B2BRole.GUEST].includes(Number(role)) &&
      shoppingListConfig.extraFields.b2b
    ) {
      setIsAddToShoppingListEnabled(true);
    }
  }, [sdk]);

  return isAddToShoppingListEnabled;
};
