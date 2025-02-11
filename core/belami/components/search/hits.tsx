import React from 'react';
import { useState, useEffect } from 'react';
import { useHits } from 'react-instantsearch';
import { Hit } from './hit';
import QuickView from '~/components/product-card/Quickview';

export function Hits({
  hitComponent,
  view,
  useDefaultPrices,
  promotions,
  priceMaxRules,
  ...props
}: any) {
  const { items, sendEvent } = useHits(props);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prices, setPrices] = useState({} as any);
  const [cachedPrices, setCachedPrices] = useState({} as any);
  const [hits, setHits] = useState(null as any);

  const skus: string[] = items.map((hit: any) => hit.sku);

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

            setHits(
              items.map((hit: any) => ({
                ...hit,
                prices:
                  data.data && data.data[hit.sku] && data.data[hit.sku].price
                    ? {
                        USD: data.data[hit.sku].price,
                      }
                    : hit.prices,
                sales_prices:
                  data.data && data.data[hit.sku] && data.data[hit.sku].salePrice
                    ? {
                        USD: data.data[hit.sku].salePrice,
                      }
                    : hit.sales_prices,
              })),
            );

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

  const renderProductCard = (hit: any) => {
    const productData = {
      ...hit,
      images: {
        edges: hit.images?.map((img: any) => ({
          node: {
            url: img.url,
            altText: img.altText,
            isDefault: img.isDefault
          }
        }))
      }
    };

    return (
      <div className="product-card">
       
        <div className="relative group/image">
          
          <div className="absolute left-0 right-0 flex justify-center z-10 opacity-0 group-hover/image:opacity-100 transition-opacity mt-32">
            <div className="w-48">
              <QuickView 
                product={productData} 
                
              />
            </div>
          </div>

          <div className="product-image-wrapper">
            {hit.images?.[0]?.url && (
              <img
                src={hit.images[0].url}
                alt={hit.images[0].altText || hit.name}
                className="w-full h-auto"
              />
            )}
          </div>
        </div>

        {/* Product Information */}
        <div className="product-info">
          <Hit
            hit={hit as any}
            promotions={promotions}
            priceMaxRules={priceMaxRules}
            view={view}
          />
        </div>
      </div>
    );
  };

  return (
    ((!useDefaultPrices && hits) || (useDefaultPrices && items)) && (
      <div className="ais-Hits product-card-plp mt-4">
        <ol
          className={
            view == 'list'
              ? 'ais-Hits-list grid grid-cols-1 gap-4'
              : 'ais-Hits-list grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
          }
        >
          {(!useDefaultPrices ? hits : items).map((hit: any) => (
            <li
              className="ais-Hits-item !radius-none !p-0 !shadow-none rounded-none border border-gray-300"
              key={hit.objectID}
              onClick={() => sendEvent('click', hit, 'Hit Clicked')}
              onAuxClick={() => sendEvent('click', hit, 'Hit Clicked')}
            >
              {renderProductCard(hit)}
            </li>
          ))}
        </ol>
      </div>
    )
  );
}

export function HitsAsync({
  hitComponent,
  view,
  useDefaultPrices,
  promotions,
  priceMaxRules,
  ...props
}: any) {
  const { items, sendEvent } = useHits(props);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prices, setPrices] = useState({} as any);
  const [cachedPrices, setCachedPrices] = useState({} as any);

  const skus: string[] = items.map((hit: any) => hit.sku);

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

  const renderProductCard = (hit: any) => {
    const productData = {
      ...hit,
      images: {
        edges: hit.images?.map((img: any) => ({
          node: {
            url: img.url,
            altText: img.altText,
            isDefault: img.isDefault
          }
        }))
      }
    };

    return (
      <div className="product-card">
        <div className="relative group/image">
          <div className="absolute left-0 right-0 flex justify-center z-10 opacity-0 group-hover/image:opacity-100 transition-opacity mt-32">
            <div className="w-48">
              <QuickView 
                product={productData} 
               
              />
            </div>
          </div>

          <div className="product-image-wrapper">
            {hit.images?.[0]?.url && (
              <img
                src={hit.images[0].url}
                alt={hit.images[0].altText || hit.name}
                className="w-full h-auto"
              />
            )}
          </div>
        </div>

        <div className="product-info">
          <Hit
            hit={hit as any}
            promotions={promotions}
            priceMaxRules={priceMaxRules}
            useDefaultPrices={useDefaultPrices}
            price={
              hit.sku && prices && prices[hit.sku] && prices[hit.sku].price
                ? prices[hit.sku].price
                : null
            }
            salePrice={
              hit.sku && prices && prices[hit.sku] && prices[hit.sku].salePrice
                ? prices[hit.sku].salePrice
                : null
            }
            isLoading={isLoading}
            isLoaded={isLoaded}
            view={view}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="ais-Hits mt-4">
      <ol
        className={
          view == 'list'
            ? 'ais-Hits-list grid grid-cols-1 gap-4'
            : 'ais-Hits-list grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'
        }
      >
        {items.map((hit: any) => (
          <li
          className="ais-Hits-item !radius-none !p-0"
          key={hit.objectID}
          onClick={() => sendEvent('click', hit, 'Hit Clicked')}
          onAuxClick={() => sendEvent('click', hit, 'Hit Clicked')}
        >
            {renderProductCard(hit)}
          </li>
        ))}
      </ol>
    </div>
  );
}