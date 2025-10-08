'use server';

import { getTranslations } from 'next-intl/server';

export const getBackorderQuantityMessage = async (
  orderQuantity: number,
  availableOnHand: number,
  availableForBackorder: number,
): Promise<string | undefined> => {
  if (orderQuantity <= availableOnHand) {
    return undefined;
  }

  const t = await getTranslations('Product.ProductDetails');

  return t('backorderQuantity', {
    quantity: Math.min(orderQuantity - availableOnHand, availableForBackorder),
  });
};
