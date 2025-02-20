'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

import noImage from '~/public/no-image.svg';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '~/belami/components/carousel';

import { useFormatter } from 'next-intl';

import { ProductPrice } from '~/belami/components/search/product-price';
import { ReviewSummary } from '~/belami/components/reviews';

import searchColors from '~/belami/include/search-colors.json';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

interface Props {
  collection: string,
  products: any[],
  useDefaultPrices?: boolean,
  priceMaxRules?: any
}

function getDiscount(price: number, sale: number): number | null {
  return price > 0 ? Math.round(((price - sale) * 100) / price) : 0;
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

function CustomItem({ hit, priceMaxRules = null, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false }: any) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article data-id={hit.objectID} className="w-full product flex flex-col h-full rounded-none">
      <div className="p-0">
        <div className="flex my-0 mx-auto pb-full w-full h-auto overflow-hidden pb-[100%] relative">
          <figure className="absolute left-0 top-0 w-full h-full">
            <Link href={hit.url} className="w-full h-full flex justify-center items-center align-middle bg-white">
              {hit.image_url
                ? <img src={imageUrl || ''} alt={hit.name} className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                : <Image src={noImage} alt="No Image" className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
              }
            </Link>
          </figure>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-0 text-center">
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
          <h2 className="text-base font-medium mt-2 leading-6"><Link href={hit.url}>{hit.name}</Link></h2>

          <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center justify-center">
            <ProductPrice 
              defaultPrice={hit?.prices?.USD || 0} 
              defaultSalePrice={hit?.sales_prices?.USD || null} 
              price={price}
              salePrice={salePrice}
              priceMaxRule={priceMaxRules?.find((r: any) => (r.bc_brand_ids && (r.bc_brand_ids.includes(hit?.brand_id) || r.bc_brand_ids.includes(String(hit?.brand_id)))) || (r.skus && r.skus.includes(hit?.sku)))}
              currency={currency}
              format={format}
              options={{
                useAsyncMode: useAsyncMode,
                useDefaultPrices: useDefaultPrices,
                isLoading: isLoading,
                isLoaded: isLoaded
              }}
              classNames={{
                root: 'mt-2 flex flex-wrap items-center justify-center space-x-2 md:justify-start',
                discount: 'font-bold text-brand-400 whitespace-nowrap',
              }}
            />
            {!!hit.on_clearance &&
              <span className="mt-2 inline-block px-1 py-0.5 bg-gray-400 text-white text-xs uppercase tracking-wider">Clearance</span>
            }
          </div>

          {hit.reviews_count > 0 &&
            <ReviewSummary numberOfReviews={hit.reviews_count} averageRating={hit.reviews_rating_sum} className="mx-auto mt-2 justify-center" />
          }
        </div>
      </div>
    </article>
  );
}

export function CollectionProducts({ collection, products, useDefaultPrices = false, priceMaxRules }: Props) {

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
    <div className="p-4 xl:p-8 bg-gray-50 mt-8 mb-12">
      <div className="md:flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4">
        <h2 className="text-3xl font-black text-[1.5rem] font-normal leading-[2rem] text-left text-[#353535] md:flex-grow md:mr-auto">{`More from ${collection} collection`}</h2>
        <Link href={`/search?collection[0]=${encodeURIComponent(collection)}`} className="md:flex-none text-brand-500 text-xl">Shop the Collection</Link>
      </div>
      <Carousel className="overflow-x-hidden mb-16 mt-5 lg:mt-6">
        <CarouselContent className="mb-10">
        {products.map((item: any) => (
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5" key={item.objectID}>
          <CustomItem 
            hit={item} 
            priceMaxRules={priceMaxRules}
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
          />
          </CarouselItem>
        ))}
        </CarouselContent>
        <CarouselScrollbar className="carousel-scrollbar" />
        <CarouselButtons className="carousel-arrows" />
      </Carousel>
    </div>
  );
}