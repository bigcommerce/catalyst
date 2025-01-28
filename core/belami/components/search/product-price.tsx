import { clsx } from 'clsx';

export function ProductPrice({ 
  classNames, 
  defaultPrice, 
  defaultSalePrice, 
  price = null, 
  salePrice = null, 
  currency = 'USD', 
  format,
  options = {
    useAsyncMode: true,
    useDefaultPrices: false,
    isLoading: false,
    isLoaded: false
  }
}: { 
  classNames?: {
    root?: string,
    oldPrice?: string,
    discount?: string,
    newPrice?: string,
    price?: string
  }, 
  defaultPrice: number, 
  defaultSalePrice?: number | null, 
  price?: number | null, 
  salePrice?: number | null, 
  currency?: string, 
  format: any,
  options?: {
    useAsyncMode: boolean,
    useDefaultPrices: boolean,
    isLoading: boolean,
    isLoaded: boolean
  }
}) {

  function getDiscount(price: number, salePrice: number): number | null {
    return price > 0 ? Math.round(((price - salePrice) * 100) / price) : 0;
  }

  return <>
    {options?.useAsyncMode && !options?.useDefaultPrices 
      ? !options?.isLoading && (price || salePrice) 
        ? <div className={clsx('product-price', classNames?.root)}>
            {!!price && !!salePrice ?
              <>
                <s className={clsx('old-price', classNames?.oldPrice)}>{format.number(price || 0, { style: 'currency', currency: currency })}</s> 
                <strong className={clsx('discount', classNames?.discount)}>Save {getDiscount(price || 0, salePrice || 0)}%</strong> 
                <span className={clsx('new-price', classNames?.newPrice)}>{format.number(salePrice || 0, { style: 'currency', currency: currency })}</span>                
              </>
            : <span className={clsx('price', classNames?.price)}>{format.number(price || 0, { style: 'currency', currency: currency })}</span>
            }
          </div>
        : (!options?.isLoading && options?.isLoaded) 
          ? !!defaultPrice && 
            <div className={clsx('product-price', classNames?.root)}>
              {!!defaultSalePrice ?
                <>
                  <s className={clsx('old-price', classNames?.oldPrice)}>{format.number(defaultPrice || 0, { style: 'currency', currency: currency })}</s> 
                  <strong className={clsx('discount', classNames?.discount)}>Save {getDiscount(defaultPrice, defaultSalePrice || 0)}%</strong> 
                  <span className={clsx('new-price', classNames?.newPrice)}>{format.number(defaultSalePrice || 0, { style: 'currency', currency: currency })}</span>
                </>
              : <span className={clsx('price', classNames?.price)}>{format.number(defaultPrice, { style: 'currency', currency: currency })}</span>
              }
            </div>
          : <div>Loading...</div>
    : !!defaultPrice && 
      <div className={clsx('product-price', classNames?.root)}>
        {!!defaultSalePrice ? 
          <>
            <s className={clsx('old-price', classNames?.oldPrice)}>{format.number(defaultPrice || 0, { style: 'currency', currency: currency })}</s> 
            <strong className={clsx('discount', classNames?.discount)}>Save {getDiscount(defaultPrice, defaultSalePrice || 0)}%</strong> 
            <span className={clsx('new-price', classNames?.newPrice)}>{format.number(defaultSalePrice || 0, { style: 'currency', currency: currency })}</span>
          </>
        : <span className={clsx('price', classNames?.price)}>{format.number(defaultPrice, { style: 'currency', currency: currency })}</span>
        }
      </div>
    }
  </>
}