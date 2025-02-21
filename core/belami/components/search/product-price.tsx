import { clsx } from 'clsx';

export function ProductPrice({
  classNames,
  defaultPrice,
  defaultSalePrice,
  price = null,
  salePrice = null,
  priceMaxRule = null,
  currency = 'USD',
  format,
  showMSRP = false,
  warrantyApplied = false,
  options = {
    useAsyncMode: true,
    useDefaultPrices: false,
    isLoading: false,
    isLoaded: false,
  },
}: {
  classNames?: {
    root?: string;
    oldPrice?: string;
    discount?: string;
    newPrice?: string;
    price?: string;
    msrp?: string;
  };
  defaultPrice: number;
  defaultSalePrice?: number | null;
  price?: number | null;
  salePrice?: number | null;
  priceMaxRule?: any | null;
  currency?: string;
  format: any;
  showMSRP?: boolean;
  warrantyApplied?: boolean;
  options?: {
    useAsyncMode?: boolean;
    useDefaultPrices?: boolean;
    isLoading?: boolean;
    isLoaded?: boolean;
  };
}) {
  if (priceMaxRule && !!priceMaxRule.discount) {
    const discount = Number(priceMaxRule.discount);
    if (options?.useDefaultPrices && !!defaultPrice) {
      const originalPrice =
        priceMaxRule.is_sale_included && defaultSalePrice && Number(defaultSalePrice) > 0
          ? defaultSalePrice
          : defaultPrice;
      const originalSalePrice = defaultSalePrice;
      const discountedPrice = originalPrice - (originalPrice * discount) / 100;
      defaultSalePrice =
        !!originalSalePrice && Number(originalSalePrice) < discountedPrice
          ? originalSalePrice
          : Number(discountedPrice.toFixed(2));
    } else if (!options?.useDefaultPrices && !!price) {
      const originalPrice =
        priceMaxRule.is_sale_included && salePrice && Number(salePrice) > 0 ? salePrice : price;
      const originalSalePrice = salePrice;
      const discountedPrice = originalPrice - (originalPrice * discount) / 100;
      salePrice =
        !!originalSalePrice && Number(originalSalePrice) < discountedPrice
          ? originalSalePrice
          : Number(discountedPrice.toFixed(2));
    }
  }

  function getDiscount(price: number, salePrice: number): number | null {
    return price > 0 ? Math.round(((price - salePrice) * 100) / price) : 0;
  }

  return (
    <>
      {options?.useAsyncMode && !options?.useDefaultPrices ? (
        !options?.isLoading && (price || salePrice) ? (
          <div className={clsx('product-price', classNames?.root)}>
            {!!price && !!salePrice ? (
              warrantyApplied ? (
                <span className={clsx('new-price', classNames?.newPrice)}>
                  {format.number(salePrice || 0, { style: 'currency', currency: currency })}
                </span>
              ) : (
                <>
                  <span className={clsx('new-price', classNames?.newPrice)}>
                    {format.number(salePrice || 0, { style: 'currency', currency: currency })}
                  </span>
                  <s className={clsx('old-price', classNames?.oldPrice)}>
                    {format.number(price || 0, { style: 'currency', currency: currency })}
                  </s>
                  {showMSRP && <span className={clsx('msrp', classNames?.msrp)}>MSRP</span>}
                  <strong className={clsx('discount', classNames?.discount)}>
                    Save {getDiscount(price || 0, salePrice || 0)}%
                  </strong>
                </>
              )
            ) : (
              <span className={clsx('price', classNames?.price)}>
                {format.number(price || 0, { style: 'currency', currency: currency })}
              </span>
            )}
          </div>
        ) : !options?.isLoading && options?.isLoaded ? (
          !!defaultPrice && (
            <div className={clsx('product-price', classNames?.root)}>
              {!!defaultSalePrice ? (
                warrantyApplied ? (
                  <span className={clsx('new-price', classNames?.newPrice)}>
                    {format.number(defaultSalePrice || 0, {
                      style: 'currency',
                      currency: currency,
                    })}
                  </span>
                ) : (
                  <>
                    <span className={clsx('new-price', classNames?.newPrice)}>
                      {format.number(defaultSalePrice || 0, {
                        style: 'currency',
                        currency: currency,
                      })}
                    </span>
                    <s className={clsx('old-price', classNames?.oldPrice)}>
                      {format.number(defaultPrice || 0, { style: 'currency', currency: currency })}
                    </s>
                    {showMSRP && <span className={clsx('msrp', classNames?.msrp)}>MSRP</span>}
                    <strong className={clsx('discount', classNames?.discount)}>
                      Save {getDiscount(defaultPrice, defaultSalePrice || 0)}%
                    </strong>
                  </>
                )
              ) : (
                <span className={clsx('price', classNames?.price)}>
                  {format.number(defaultPrice, { style: 'currency', currency: currency })}
                </span>
              )}
            </div>
          )
        ) : (
          <div>Loading...</div>
        )
      ) : (
        !!defaultPrice && (
          <div className={clsx('product-price', classNames?.root)}>
            {!!defaultSalePrice ? (
              warrantyApplied ? (
                <span className={clsx('new-price', classNames?.newPrice)}>
                  {format.number(defaultSalePrice || 0, { style: 'currency', currency: currency })}
                </span>
              ) : (
                <>
                  <span className={clsx('new-price', classNames?.newPrice)}>
                    {format.number(defaultSalePrice || 0, {
                      style: 'currency',
                      currency: currency,
                    })}
                  </span>
                  <s className={clsx('old-price', classNames?.oldPrice)}>
                    {format.number(defaultPrice || 0, { style: 'currency', currency: currency })}
                  </s>
                  {showMSRP && <span className={clsx('msrp', classNames?.msrp)}>MSRP</span>}
                  <strong className={clsx('discount', classNames?.discount)}>
                    Save {getDiscount(defaultPrice, defaultSalePrice || 0)}%
                  </strong>
                </>
              )
            ) : (
              <span className={clsx('price', classNames?.price)}>
                {format.number(defaultPrice, { style: 'currency', currency: currency })}
              </span>
            )}
          </div>
        )
      )}
    </>
  );
}
