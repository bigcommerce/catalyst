'use client';

import React from 'react';
import { useState, useEffect } from 'react';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';
//import { imageManagerImageUrl } from '~/lib/store-assets';

import noImage from '~/public/no-image.svg';

//import { Carousel } from '~/components/ui/carousel2';
//import { ProductCard } from '~/components/product-card';

import { useFormatter } from 'next-intl';

import { cn } from '~/lib/utils';

import searchColors from './search-colors.json';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';
//const useAsyncMode = false;

interface Props {
  collection: string,
  products: any[],
  useDefaultPrices?: boolean
}

function getDiscount(price: number, sale: number): number | null {
  return price > 0 ? Math.floor(((price - sale) * 100) / price) : 0;
}

function ColorSwatches({ variants, onImageClick }: any) {
  const items = variants && variants.length > 0 ? variants.filter((item: any) => Object.hasOwn(item.options, 'Finish Color')).map((item: any) => item.options['Finish Color']).filter((value: string, index: number, array: Array<string>) => array.indexOf(value) === index) : null;

  const imageUrls = {} as any;
  const items2 = items && items.length > 0 ? variants.filter((item: any) => item.image_url && item.image_url.length > 0 && Object.hasOwn(item.options, 'Finish Color')).map((item: any) => {
    imageUrls[item.options['Finish Color']] = item.image_url.replace('.220.290.', '.386.513.');
  }) : null;

  return (
    //items && items.length > 0 &&
    //<>
      <div className="mx-auto mt-4 h-8 flex space-x-2 items-center justify-center">
        {items.slice(0, 5).map((item: string) => <button key={item} type="button" title={item} className="rounded-full w-8 h-8 border border-gray-500 cursor-auto" style={
          searchColorsHEX[item] && searchColorsHEX[item].indexOf('.svg') !== -1
            ? { backgroundImage: `url("/swatches/${searchColorsHEX[item]}")`, backgroundSize: `cover`, backgroundRepeat: `no-repeat` }
            : { backgroundColor: (searchColorsHEX[item] ?? 'transparent') }
        } onClick={() => imageUrls[item] ? onImageClick(imageUrls[item]) : null} />)}
        {items.length > 5 &&
          <span>+{(items.length - 5)}</span>
        }
      </div>
    //</>
  )
}

function CustomItem({ hit, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false, className = {} }: any) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article data-id={hit.objectID} className={cn("w-full product flex flex-col h-full", className)}>
      <div>
        <div className="flex my-0 mx-auto pb-full w-full h-auto overflow-hidden pb-[100%] relative">
          <figure className="absolute left-0 top-0 w-full h-full">
            <Link href={hit.url} className="w-full h-full flex justify-center items-center align-middle">
              {hit.image_url
                ? <img src={imageUrl || ''} alt={hit.name} className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                : <Image src={noImage} alt="No Image" className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
              }
            </Link>
          </figure>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4 text-center">
          {/*
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
          */}
          <h2 className="text-lg font-medium mt-2"><Link href={hit.url}>{hit.name}</Link></h2>
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center justify-center">
              {hit.on_clearance &&
                <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
              }

              {!isLoading && (price || salePrice) ?
                <div className="mt-2 flex space-x-2 items-center">
                  {salePrice && salePrice > 0 ? <s>{format.number(price || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(price || 0, { style: 'currency', currency: currency })}</span>}
                  {price && salePrice && salePrice > 0 ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(price, salePrice)}%</strong> : null}
                  {salePrice && salePrice > 0 ? <span>{format.number(salePrice || 0, { style: 'currency', currency: currency })}</span> : null}
                </div> :
                (!isLoading && isLoaded ? (
                  hit.prices ?
                    <div className="mt-2 flex space-x-2 items-center">
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                        {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                    </div> : null
                )
                  : 'Loading...')
              }
            </div>
          ) : (
            hit.prices ?
              <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center justify-center">
                {hit.on_clearance &&
                  <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
                }
                <div className="mt-2 flex space-x-2 items-center">
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <s>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</s> : <span>{format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}</span>}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <strong className="font-bold text-brand-400 whitespace-nowrap">Save {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%</strong> : null}
                  {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) || hit.on_sale ? <span>{format.number(hit.sales_prices.USD || 0, { style: 'currency', currency: currency })}</span> : null}
                </div>
              </div> : null
          )}
          <div className="mx-auto mt-2 flex space-x-2 items-center justify-center">
            <span className="flex space-x-0.5 text-yellow-500">
              <svg key={1} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={2} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={3} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={4} width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              <svg key={5} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
            </span>
            <span>(10)</span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function CollectionProducts({ collection, products, useDefaultPrices = false }: Props) {
  const breakpoints = ["xs:flex", "sm:flex", "md:flex", "lg:flex", "xl:flex", "2xl:flex"];

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [prices, setPrices] = useState({} as any);
  const [cachedPrices, setCachedPrices] = useState({} as any);

  const skus: string[] = products.map((hit: any) => hit.sku);

  useEffect(() => {
    (async () => {
      if (!useDefaultPrices && !isLoading) {
        if (!cachedPrices[skus.join(',')]) {
          try {
            setIsLoaded(false);
            setIsLoading(true);
            console.log(skus.join(','));
            const response = await fetch('/api/prices/?skus=' + skus.join(','));
            const data = await response.json();
            console.log(data);
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

  return (
    products && products.length > 0 &&
    <div className="carousel-container p-4 xl:p-8 bg-gray-50 mt-8 mb-12">
      <h2 className="text-3xl font-black text-[1.5rem] font-normal leading-[2rem] text-left text-[#353535]">{`More from ${collection} collection`}</h2>
      <div className="mt-5 grid xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 xl:gap-8">
        {products.map((item: any, index: number) => (
          <CustomItem 
            key={item.objectID} 
            hit={item} 
            useDefaultPrices={useDefaultPrices}
            price={
              item.sku && prices && prices[item.sku] && prices[item.sku].price
                ? prices[item.sku].price
                : null
            }
            salePrice={
              item.sku && prices && prices[item.sku] && prices[item.sku].salePrice
                ? prices[item.sku].salePrice
                : null
            }
            isLoading={isLoading}
            isLoaded={isLoaded}
            className={cn(
              index > 0 && index < 6 && `hidden ${breakpoints[index]}` 
            )} 
          />
        ))}
      </div>
    </div>
  );
}
