import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { PricingFragment } from '~/client/fragments/pricing';
import { ExistingResultType } from '~/client/util';
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
      minValue: format.number(prices.priceRange.min.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      maxValue: format.number(prices.priceRange.max.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
    };
  }

  if (isSalePrice && prices.salePrice && prices.basePrice) {
    return {
      type: 'sale',
      previousValue: format.number(prices.basePrice.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
      currentValue: format.number(prices.price.value, {
        style: 'currency',
        currency: prices.price.currencyCode,
      }),
    };
  }

  return format.number(prices.price.value, {
    style: 'currency',
    currency: prices.price.currencyCode,
  });
};
