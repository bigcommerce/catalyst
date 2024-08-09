import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { ExistingResultType } from '~/client/util';
import { PricingFragment } from '~/components/product-card';
import { Price } from '~/components/ui/product-card';

export const pricesTransformer = (
  prices: ResultOf<typeof PricingFragment>['prices'],
  format: ExistingResultType<typeof getFormatter>,
): Price | undefined => {
  if (!prices) {
    return undefined;
  }

  const isPriceRange = prices.priceRange.min.value !== prices.priceRange.max.value;
  const isSalePrice = prices.salePrice?.value !== prices.basePrice?.value;

  if (isPriceRange) {
    return {
      type: 'range',
      min: format.number(prices.priceRange.min.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      max: format.number(prices.priceRange.max.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
    };
  }

  if (isSalePrice && prices.salePrice && prices.basePrice) {
    return {
      type: 'sale',
      originalAmount: format.number(prices.basePrice.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      amount: format.number(prices.price.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      msrp:
        prices.retailPrice && prices.retailPrice.value !== prices.basePrice.value
          ? format.number(prices.retailPrice.value, {
              style: 'currency',
              currency: prices.price.currencyCode,
            })
          : undefined,
    };
  }

  return {
    type: 'fixed',
    amount: format.number(prices.price.value, {
      style: 'currency',
      currency: prices.price.currencyCode,
    }),
    msrp:
      prices.retailPrice && prices.retailPrice.value !== prices.price.value
        ? format.number(prices.retailPrice.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          })
        : undefined,
  };
};
