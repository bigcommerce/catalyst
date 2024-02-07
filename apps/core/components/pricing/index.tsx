import { Product } from '../product-card';

export const Pricing = ({ prices }: { prices: Product['prices'] }) => {
  if (!prices) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: prices.price?.currencyCode,
  });

  const showPriceRange = prices.priceRange?.min?.value !== prices.priceRange?.max?.value;

  return (
    <p className="w-36 shrink-0">
      {showPriceRange &&
      prices.priceRange?.min?.value !== undefined &&
      prices.priceRange.max?.value !== undefined ? (
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
            prices.price?.value && <>{currencyFormatter.format(prices.price.value)}</>
          )}
        </>
      )}
    </p>
  );
};
