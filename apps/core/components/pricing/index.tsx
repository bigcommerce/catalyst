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

export const Pricing = ({ data }: Props) => {
  const { prices } = data;

  if (!prices) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: prices.price.currencyCode,
  });

  const showPriceRange = prices.priceRange.min.value !== prices.priceRange.max.value;

  return (
    <p className="w-36 shrink-0">
      {showPriceRange ? (
        <>
          {currencyFormatter.format(prices.priceRange.min.value)} -{' '}
          {currencyFormatter.format(prices.priceRange.max.value)}
        </>
      ) : (
        <>
          {prices.retailPrice?.value !== undefined && (
            <>
              MSRP:{' '}
              <span className="line-through">
                {currencyFormatter.format(prices.retailPrice.value)}
              </span>
              <br />
            </>
          )}
          {prices.salePrice?.value !== undefined && prices.basePrice?.value !== undefined ? (
            <>
              Was:{' '}
              <span className="line-through">
                {currencyFormatter.format(prices.basePrice.value)}
              </span>
              <br />
              <>Now: {currencyFormatter.format(prices.salePrice.value)}</>
            </>
          ) : (
            prices.price.value && <>{currencyFormatter.format(prices.price.value)}</>
          )}
        </>
      )}
    </p>
  );
};
