import { ProductCardInfoPrice } from '@bigcommerce/reactant/ProductCard';

import { Product } from '.';

export const Pricing = ({ prices }: { prices: Product['prices'] }) => {
  if (!prices) {
    return null;
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: prices.price?.currencyCode,
  });

  const showPriceRange = prices.priceRange?.min?.value !== prices.priceRange?.max?.value;

  return showPriceRange &&
    prices.priceRange?.min?.value !== undefined &&
    prices.priceRange.max?.value !== undefined ? (
    <div>
      <ProductCardInfoPrice className="w-[144px] shrink-0 pt-0">
        {currencyFormatter.format(prices.priceRange.min.value)} -{' '}
        {currencyFormatter.format(prices.priceRange.max.value)}
      </ProductCardInfoPrice>
    </div>
  ) : (
    <div>
      {prices.retailPrice?.value !== undefined && (
        <ProductCardInfoPrice className="w-[144px] shrink-0 pt-0">
          MSRP:{' '}
          <span className="line-through">{currencyFormatter.format(prices.retailPrice.value)}</span>
        </ProductCardInfoPrice>
      )}
      {prices.basePrice?.value !== undefined && (
        <ProductCardInfoPrice className="w-[144px] shrink-0 pt-0">
          {prices.salePrice?.value ? (
            <>
              Was:{' '}
              <span className="line-through">
                {currencyFormatter.format(prices.basePrice.value)}
              </span>
            </>
          ) : (
            currencyFormatter.format(prices.basePrice.value)
          )}
        </ProductCardInfoPrice>
      )}
      {prices.salePrice?.value !== undefined && (
        <ProductCardInfoPrice className="w-[144px] shrink-0 pt-0">
          Now: {currencyFormatter.format(prices.salePrice.value)}
        </ProductCardInfoPrice>
      )}
    </div>
  );
};
