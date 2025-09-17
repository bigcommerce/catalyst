import { ResultOf } from 'gql.tada';
import { getFormatter } from 'next-intl/server';

import { Price } from '@/vibes/soul/primitives/price-label';
import { PricesFragment, PricingFragment } from '~/client/fragments/pricing';
import { ExistingResultType } from '~/client/util';

const transformPrice = (
  price: ResultOf<typeof PricesFragment> | null | undefined,
  format: ExistingResultType<typeof getFormatter>,
): Price | undefined => {
  if (!price) {
    return undefined;
  }

  const isPriceRange = price.priceRange.min.value !== price.priceRange.max.value;
  const isSalePrice = price.salePrice?.value !== price.basePrice?.value;

  if (isPriceRange) {
    return {
      type: 'range',
      minValue: format.number(price.priceRange.min.value, {
        style: 'currency',
        currency: price.price.currencyCode,
      }),
      maxValue: format.number(price.priceRange.max.value, {
        style: 'currency',
        currency: price.price.currencyCode,
      }),
    };
  }

  if (isSalePrice && price.salePrice && price.basePrice) {
    return {
      type: 'sale',
      previousValue: format.number(price.basePrice.value, {
        style: 'currency',
        currency: price.price.currencyCode,
      }),
      currentValue: format.number(price.price.value, {
        style: 'currency',
        currency: price.price.currencyCode,
      }),
    };
  }

  return format.number(price.price.value, {
    style: 'currency',
    currency: price.price.currencyCode,
  });
};

export const pricesTransformer = (
  prices: ResultOf<typeof PricingFragment>,
  // eslint-disable-next-line @typescript-eslint/default-param-last
  tax: 'BOTH' | 'EX' | 'INC' = 'EX',
  format: ExistingResultType<typeof getFormatter>,
): Price | [Price, Price] | undefined => {
  switch (tax) {
    case 'BOTH': {
      const priceExcTax = transformPrice(prices.pricesExcTax, format);
      const priceIncTax = transformPrice(prices.pricesIncTax, format);

      if (priceExcTax && priceIncTax) {
        return [priceExcTax, priceIncTax];
      }

      return priceExcTax ?? priceIncTax;
    }

    default: {
      const price = tax === 'EX' ? prices.pricesExcTax : prices.pricesIncTax;

      return transformPrice(price, format);
    }
  }
};
