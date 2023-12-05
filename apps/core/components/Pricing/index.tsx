import { Product } from '../ProductCard';

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
          {prices.basePrice?.value !== undefined &&
            (prices.salePrice?.value ? (
              <>
                Was:{' '}
                <span className="line-through">
                  {currencyFormatter.format(prices.basePrice.value)}
                </span>
                <br />
              </>
            ) : (
              currencyFormatter.format(prices.basePrice.value)
            ))}
          {prices.salePrice?.value !== undefined && (
            <>Now: {currencyFormatter.format(prices.salePrice.value)}</>
          )}
        </>
      )}
    </p>
  );
};
