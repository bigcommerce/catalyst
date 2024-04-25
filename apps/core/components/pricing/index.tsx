import { getFormatter, getLocale } from 'next-intl/server';

import { graphql, ResultOf } from '~/client/graphql';

export const PricingFragment = graphql(`
  fragment PricingFragment on Product {
    prices {
      price {
        value
        currencyCode
      }
      basePrice {
        value
        currencyCode
      }
      retailPrice {
        value
        currencyCode
      }
      salePrice {
        value
        currencyCode
      }
      priceRange {
        min {
          value
          currencyCode
        }
        max {
          value
          currencyCode
        }
      }
    }
  }
`);

interface Props {
  data: ResultOf<typeof PricingFragment>;
}

export const Pricing = async ({ data }: Props) => {
  const locale = await getLocale();
  const format = await getFormatter({ locale });

  const { prices } = data;

  if (!prices) {
    return null;
  }

  const showPriceRange = prices.priceRange.min.value !== prices.priceRange.max.value;

  return (
    <p className="w-36 shrink-0">
      {showPriceRange ? (
        <>
          {format.number(prices.priceRange.min.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          })}{' '}
          -{' '}
          {format.number(prices.priceRange.max.value, {
            style: 'currency',
            currency: prices.price.currencyCode,
          })}
        </>
      ) : (
        <>
          {prices.retailPrice?.value !== undefined && (
            <>
              MSRP:{' '}
              <span className="line-through">
                {format.number(prices.retailPrice.value, {
                  style: 'currency',
                  currency: prices.price.currencyCode,
                })}
              </span>
              <br />
            </>
          )}
          {prices.salePrice?.value !== undefined && prices.basePrice?.value !== undefined ? (
            <>
              Was:{' '}
              <span className="line-through">
                {format.number(prices.basePrice.value, {
                  style: 'currency',
                  currency: prices.price.currencyCode,
                })}
              </span>
              <br />
              <>
                Now:{' '}
                {format.number(prices.salePrice.value, {
                  style: 'currency',
                  currency: prices.price.currencyCode,
                })}
              </>
            </>
          ) : (
            prices.price.value && (
              <>
                {format.number(prices.price.value, {
                  style: 'currency',
                  currency: prices.price.currencyCode,
                })}
              </>
            )
          )}
        </>
      )}
    </p>
  );
};
