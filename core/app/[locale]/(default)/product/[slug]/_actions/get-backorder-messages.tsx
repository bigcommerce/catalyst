'use server';

import { getTranslations } from 'next-intl/server';

import {
  BackorderMessages,
  OrderQuantitiesData,
} from '@/vibes/soul/sections/product-detail/product-detail-form';

export const getBackorderMessages = async (
  orderQuantitiesData: OrderQuantitiesData,
): Promise<BackorderMessages | undefined> => {
  const {
    orderQuantity,
    availableOnHand,
    availableForBackorder,
    unlimitedBackorder,
    backorderMessage,
    showQuantityOnBackorder,
  } = orderQuantitiesData;

  if (Number.isNaN(orderQuantity) || orderQuantity <= availableOnHand) {
    return undefined;
  }

  if (!showQuantityOnBackorder) {
    return {
      backorderQuantityMessage: undefined,
      backorderInfoMessage: backorderMessage,
    };
  }

  const t = await getTranslations('Product.ProductDetails');

  return {
    backorderQuantityMessage: t('backorderQuantity', {
      quantity: unlimitedBackorder
        ? orderQuantity - availableOnHand
        : Math.min(orderQuantity - availableOnHand, availableForBackorder),
    }),
    backorderInfoMessage: backorderMessage,
  };
};
