'use client';

import { useEffect, useState } from 'react';
import { cn } from '~/lib/utils';

import { useFormatter } from 'next-intl';
import { ProductPrice } from '~/belami/components/search/product-price';

const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

interface Props {
  products: any[];
  priceMaxRules?: any[] | null;
  useDefaultPrices?: boolean;
}

interface MetaField {
  key: string;
  value: string;
  namespace: string;
}

const attributes = [
  {
    name: 'Width',
    label: 'Width'
  }, 
  {
    name: 'Diameter',
    label: 'Diameter'
  }, 
  {
    name: 'Height',
    label: 'Height'
  }, 
  {
    name: 'Depth',
    label: 'Depth'
  }, 
  {
    name: 'Weight',
    label: 'Weight'
  }, 
  {
    name: 'Length',
    label: 'Length'
  }, 
  {
    name: 'Minimum Mounting Height',
    label: 'Minimum Mounting Height'
  }, 
  {
    name: 'Fuel Source',
    label: 'Fuel Source'
  }, 
  {
    name: 'Heating Area',
    label: 'Heating Area'
  }, 
  {
    name: 'Number of Bulbs',
    label: 'Number of Bulbs'
  }, 
  {
    name: 'Lamp Base Type',
    label: 'Lamp Base Type'
  }, 
  {
    name: 'Lift',
    label: 'Lift'
  }, 
  {
    name: 'Voltage',
    label: 'Voltage'
  }, 
  {
    name: 'Wattage',
    label: 'Wattage'
  }
]

function AmountUnitValue({ data }: any) {
  const value =
    typeof data === 'string' && (data.includes('{') || data.includes('[')) ? JSON.parse(data) : data;
  if (typeof value === 'object') {
    const amount: number | null = value && value.amount ? Number(value.amount) : null;
    const unit: string | null = value && value.unit ? value.unit.toLowerCase() : null;
    return <>{amount ? amount + (unit ? ' ' + unit : '') : null}</>;
  } else {
    return data;
  }
}

export function CompareProductDetails({ 
  products,
  priceMaxRules = null,
  useDefaultPrices = false
}: Props) {
  const format = useFormatter();
  //const currency = 'USD';

  const [showOnlyDifferences, setShowOnlyDifferences] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prices, setPrices] = useState({} as any);
  const [cachedPrices, setCachedPrices] = useState({} as any);

  const skus: string[] = products.map((product: any) => product.sku);

  useEffect(() => {
    (async () => {
      if (!useDefaultPrices && !isLoading) {
        if (!cachedPrices[skus.join(',')]) {
          try {
            setIsLoaded(false);
            setIsLoading(true);
            const response = await fetch('/api/prices/?skus=' + skus.join(','));
            const data = await response.json();
            setCachedPrices({
              ...cachedPrices,
              [skus.join(',')]: data.data,
            });
            setPrices(data.data);
            setIsLoading(false);
            setIsLoaded(true);
          } catch (error) {
            setIsLoading(false);
            setIsLoaded(true);
            console.error('Error fetching pricing data: ', error);
          }
        } else {
          setPrices(cachedPrices[skus.join(',')]);
          setIsLoading(false);
          setIsLoaded(true);
        }
      }
    })();
  }, [skus]);

  const uniqueValues = (arr: any[]): any[] => {
    return arr.reduce((acc, value) => {
      if (!acc.includes(value)) {
        acc.push(value);
      }
      return acc;
    }, []);
  };

  return (<>
    <tr>
      <td key={0} className="px-0 py-2">
        <label className="show-only-differences-label flex items-center justify-center space-x-2 px-4 h-10 rounded border border-brand-600 cursor-pointer bg-brand-600 text-white">
          <input className="show-only-differences-checkbox" type="checkbox" value="1" onChange={() => setShowOnlyDifferences(!showOnlyDifferences)} checked={showOnlyDifferences} /><span className="whitespace-nowrap">Show Only Differences</span>
        </label>
      </td>
      {products.map((product) => (
      <td key={product.entityId}>&nbsp;</td>
      ))}
    </tr>

    {attributes.filter(attribute => {
      const allIncludes = products.every(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name));
      const someIncludes = products.some(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name));
      const attributeValues = products.filter(product => product.metafields?.some((metafield: MetaField) => metafield.key === attribute.name)).map(product => product.metafields.find((metafield: MetaField) => metafield.key === attribute.name)?.value);

      return someIncludes && (
        !showOnlyDifferences || 
        (
          showOnlyDifferences && 
          (
            !allIncludes || 
            (allIncludes && uniqueValues(attributeValues)?.length > 1)
          )
        )
      );
    })?.map((attribute: any, index: number) => (
      <tr key={attribute.name} className={cn('border-t border-l border-gray-300', index % 2 === 0 ? 'bg-transparent' : 'bg-gray-100')}>
        <td className="p-4 border-r border-b border-gray-300 border-r-gray-700 border-r-2">{attribute.label}</td>
        {products.map((product) => {
          const metafield = product.metafields.find((metafield: MetaField) => metafield.key === attribute.name);
          return <td key={product.entityId} className="text-center p-4 text-sm border-r border-b border-gray-300">{metafield ? <AmountUnitValue data = {metafield.value} /> : 'N/A'}</td>;
        })}
      </tr>
    ))}
    <tr key={'Price'} className="">
      <td className="p-4">{/* Price */}</td>
      {products.map((product) => {
        return <td key={product.entityId} className="text-center p-4 text-sm">
          <ProductPrice
            defaultPrice={product.prices.retailPrice?.value || product.prices.price?.value || 0}
            defaultSalePrice={product.prices.salePrice?.value || null}
            price={
              product.sku && prices && prices[product.sku] && prices[product.sku].price
                ? prices[product.sku].price
                : null
            }
            salePrice={
              product.sku && prices && prices[product.sku] && prices[product.sku].salePrice
                ? prices[product.sku].salePrice
                : null
            }
            priceMaxRule={priceMaxRules?.find(
              (r: any) =>
                (r.bc_brand_ids &&
                  (r.bc_brand_ids.includes(product.brand?.entityId) ||
                    r.bc_brand_ids.includes(String(product.brand?.entityId)))) ||
                (r.skus && r.skus.includes(product?.sku)),
            )}
            currency={product.prices.price.currencyCode}
            format={format}
            options={{
              useAsyncMode: useAsyncMode,
              useDefaultPrices: useDefaultPrices,
              isLoading: isLoading,
              isLoaded: isLoaded,
            }}
            classNames={{
              root: 'mt-2 flex flex-wrap items-center justify-center space-x-2',
              discount: 'whitespace-nowrap font-bold text-brand-400',
            }}
          />
        </td>;
      })}
    </tr>
    </>);
}
