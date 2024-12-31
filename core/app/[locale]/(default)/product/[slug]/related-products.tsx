'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import { useState, useEffect } from 'react';

import {
  //LookingSimilar as AlgoliaRelatedProducts,
  RelatedProducts as AlgoliaRelatedProducts,
  //Carousel
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';
//import { imageManagerImageUrl } from '~/lib/store-assets';

import noImage from '~/public/no-image.svg';

//import { Carousel } from '~/components/ui/carousel2';
//import { ProductCard } from '~/components/product-card';

import {
  Carousel,
  CarouselButtons,
  CarouselContent,
  CarouselItem,
  CarouselScrollbar,
} from '~/belami/components/carousel';

import { useFormatter } from 'next-intl';

import { ReviewSummary } from '~/belami/components/reviews';

import searchColors from './search-colors.json';

type DynamicObject = {
  [key: string]: string;
};

const searchColorsHEX: DynamicObject = searchColors;

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

interface Props {
  productId: number,
  products: any[],
  useDefaultPrices?: boolean
}

/*
const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
);
*/

const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

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

function CustomItem({ hit, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false }: any) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article data-id={hit.objectID} className="w-full product flex flex-col h-full border border-gray-300 rounded-none">
      <div className="px-4 pt-4">
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
        <div className="flex-1 p-4 text-center">
          <ColorSwatches variants={hit.variants} onImageClick={setImageUrl} />
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

          {hit.reviews_count > 0 &&
            <ReviewSummary numberOfReviews={hit.reviews_count} averageRating={hit.reviews_rating_sum} className="mx-auto mt-2 justify-center" />
          }
        </div>
        <div className="mt-4 p-4">
          <button type="button" className="flex items-center justify-center space-x-2 px-4 w-full h-10 rounded border border-gray-300 cursor-pointer uppercase" onClick={(e) => alert('Coming Soon!')}>
            <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 12H12.565L11.9575 11.3925C12.625 10.5 13 9.375 13 8.25C13 5.3475 10.6525 3 7.75 3C6.625 3 5.5 3.375 4.5925 4.05C2.275 5.79 1.8025 9.0825 3.5425 11.4C5.2825 13.7175 8.575 14.19 10.8925 12.45L11.5 13.0575V13.5L15.25 17.25L16.75 15.75L13 12ZM7.75 12C5.68 12 4 10.32 4 8.25C4 6.18 5.68 4.5 7.75 4.5C9.82 4.5 11.5 6.18 11.5 8.25C11.5 10.32 9.82 12 7.75 12ZM1.75 4.5L0.25 6V0.75H5.5L4 2.25H1.75V4.5ZM15.25 0.75V6L13.75 4.5V2.25H11.5L10 0.75H15.25ZM4 14.25L5.5 15.75H0.25V10.5L1.75 12V14.25H4Z" fill="#353535"/>
            </svg>
            <span>Quick View</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export function RelatedProducts({ productId, products, useDefaultPrices = false }: Props) {

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
    <div className="mt-4 mb-12">
      {/*
      <Carousel
        pageSize={6}
        products={products.map((item: any) => (
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
          />
        ))}
        title="You May Also Like ..."
        icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-500"><g><path d="M0.974976 7.0001C0.974976 5.33343 1.56248 3.9126 2.73748 2.7376C3.91248 1.5626 5.33331 0.975098 6.99998 0.975098V3.0001C5.89998 3.0001 4.95831 3.39176 4.17498 4.1751C3.39164 4.95843 2.99998 5.9001 2.99998 7.0001H0.974976ZM5.29998 18.7251C3.78331 17.2084 3.02498 15.3834 3.02498 13.2501C3.02498 11.1168 3.78331 9.29176 5.29998 7.7751L7.04998 6.0001L7.34998 6.3001C7.83331 6.78343 8.07498 7.37093 8.07498 8.0626C8.07498 8.75426 7.83331 9.34176 7.34998 9.8251L6.99998 10.1751C6.79998 10.3751 6.69998 10.6126 6.69998 10.8876C6.69998 11.1626 6.79998 11.4001 6.99998 11.6001L7.89998 12.5001C8.33331 12.9334 8.54998 13.4584 8.54998 14.0751C8.54998 14.6918 8.33331 15.2168 7.89998 15.6501L8.97498 16.7251C9.70831 15.9918 10.075 15.1126 10.075 14.0876C10.075 13.0626 9.69998 12.1751 8.94998 11.4251L8.39998 10.8751C8.83331 10.4418 9.14164 9.95426 9.32498 9.4126C9.50831 8.87093 9.58331 8.31676 9.54998 7.7501L14.025 3.2751C14.225 3.0751 14.4625 2.9751 14.7375 2.9751C15.0125 2.9751 15.25 3.0751 15.45 3.2751C15.65 3.4751 15.75 3.7126 15.75 3.9876C15.75 4.2626 15.65 4.5001 15.45 4.7001L10.775 9.3751L11.825 10.4251L17.85 4.4251C18.05 4.2251 18.2833 4.1251 18.55 4.1251C18.8166 4.1251 19.05 4.2251 19.25 4.4251C19.45 4.6251 19.55 4.85843 19.55 5.1251C19.55 5.39176 19.45 5.6251 19.25 5.8251L13.25 11.8501L14.3 12.9001L19.6 7.6001C19.8 7.4001 20.0375 7.3001 20.3125 7.3001C20.5875 7.3001 20.825 7.4001 21.025 7.6001C21.225 7.8001 21.325 8.0376 21.325 8.3126C21.325 8.5876 21.225 8.8251 21.025 9.0251L15.725 14.3251L16.775 15.3751L20.825 11.3251C21.025 11.1251 21.2625 11.0251 21.5375 11.0251C21.8125 11.0251 22.05 11.1251 22.25 11.3251C22.45 11.5251 22.55 11.7626 22.55 12.0376C22.55 12.3126 22.45 12.5501 22.25 12.7501L16.25 18.7251C14.7333 20.2418 12.9083 21.0001 10.775 21.0001C8.64164 21.0001 6.81664 20.2418 5.29998 18.7251ZM17 23.0251V21.0001C18.1 21.0001 19.0416 20.6084 19.825 19.8251C20.6083 19.0418 21 18.1001 21 17.0001H23.025C23.025 18.6668 22.4375 20.0876 21.2625 21.2626C20.0875 22.4376 18.6666 23.0251 17 23.0251Z" fill="currentColor" /></g></svg>}
      />
      */}
      <h2 className="flex space-x-2 items-center text-3xl font-black text-[1.5rem] font-normal leading-[2rem] text-left text-[#353535]">
        <span><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-500"><g><path d="M0.974976 7.0001C0.974976 5.33343 1.56248 3.9126 2.73748 2.7376C3.91248 1.5626 5.33331 0.975098 6.99998 0.975098V3.0001C5.89998 3.0001 4.95831 3.39176 4.17498 4.1751C3.39164 4.95843 2.99998 5.9001 2.99998 7.0001H0.974976ZM5.29998 18.7251C3.78331 17.2084 3.02498 15.3834 3.02498 13.2501C3.02498 11.1168 3.78331 9.29176 5.29998 7.7751L7.04998 6.0001L7.34998 6.3001C7.83331 6.78343 8.07498 7.37093 8.07498 8.0626C8.07498 8.75426 7.83331 9.34176 7.34998 9.8251L6.99998 10.1751C6.79998 10.3751 6.69998 10.6126 6.69998 10.8876C6.69998 11.1626 6.79998 11.4001 6.99998 11.6001L7.89998 12.5001C8.33331 12.9334 8.54998 13.4584 8.54998 14.0751C8.54998 14.6918 8.33331 15.2168 7.89998 15.6501L8.97498 16.7251C9.70831 15.9918 10.075 15.1126 10.075 14.0876C10.075 13.0626 9.69998 12.1751 8.94998 11.4251L8.39998 10.8751C8.83331 10.4418 9.14164 9.95426 9.32498 9.4126C9.50831 8.87093 9.58331 8.31676 9.54998 7.7501L14.025 3.2751C14.225 3.0751 14.4625 2.9751 14.7375 2.9751C15.0125 2.9751 15.25 3.0751 15.45 3.2751C15.65 3.4751 15.75 3.7126 15.75 3.9876C15.75 4.2626 15.65 4.5001 15.45 4.7001L10.775 9.3751L11.825 10.4251L17.85 4.4251C18.05 4.2251 18.2833 4.1251 18.55 4.1251C18.8166 4.1251 19.05 4.2251 19.25 4.4251C19.45 4.6251 19.55 4.85843 19.55 5.1251C19.55 5.39176 19.45 5.6251 19.25 5.8251L13.25 11.8501L14.3 12.9001L19.6 7.6001C19.8 7.4001 20.0375 7.3001 20.3125 7.3001C20.5875 7.3001 20.825 7.4001 21.025 7.6001C21.225 7.8001 21.325 8.0376 21.325 8.3126C21.325 8.5876 21.225 8.8251 21.025 9.0251L15.725 14.3251L16.775 15.3751L20.825 11.3251C21.025 11.1251 21.2625 11.0251 21.5375 11.0251C21.8125 11.0251 22.05 11.1251 22.25 11.3251C22.45 11.5251 22.55 11.7626 22.55 12.0376C22.55 12.3126 22.45 12.5501 22.25 12.7501L16.25 18.7251C14.7333 20.2418 12.9083 21.0001 10.775 21.0001C8.64164 21.0001 6.81664 20.2418 5.29998 18.7251ZM17 23.0251V21.0001C18.1 21.0001 19.0416 20.6084 19.825 19.8251C20.6083 19.0418 21 18.1001 21 17.0001H23.025C23.025 18.6668 22.4375 20.0876 21.2625 21.2626C20.0875 22.4376 18.6666 23.0251 17 23.0251Z" fill="currentColor"></path></g></svg></span>
        <span>You May Also Like ...</span>
      </h2>
      <Carousel className="overflow-x-hidden mb-16 mt-5 lg:mt-6">
        <CarouselContent className="mb-10">
        {products.map((item: any) => (
          <CarouselItem className="basis-full sm:basis-1/2 md:basis-1/3 lg:basis-1/3 xl:basis-1/4 2xl:basis-1/5" key={item.objectID}>
          <CustomItem 
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
          />
          </CarouselItem>
        ))}
        </CarouselContent>
        {/* <div className="flex w-full items-center justify-between"> */}
        <CarouselScrollbar className="carousel-scrollbar" />
        <CarouselButtons className="carousel-arrows" />
        {/* </div> */}
      </Carousel>
    </div>
  );
  /*
  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      routing={{
        router: {
          cleanUrlOnDispose: false,
        },
      }}
      future={{ preserveSharedStateOnUnmount: true }}
      insights={true}
    >
      <div className="carousel-container mt-8">
        <AlgoliaRelatedProducts
          objectIDs={[productId.toString()]}
          headerComponent={() => <></>}
          layoutComponent={(props: any) => (
            <Carousel
              pageSize={6}
              products={props.items.map((item: any) => (
                <CustomItem key={item.objectID} hit={item} useDefaultPrices={true} />
              ))}
              title="You May Also Like ..."
              icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-brand-500"><g><path d="M0.974976 7.0001C0.974976 5.33343 1.56248 3.9126 2.73748 2.7376C3.91248 1.5626 5.33331 0.975098 6.99998 0.975098V3.0001C5.89998 3.0001 4.95831 3.39176 4.17498 4.1751C3.39164 4.95843 2.99998 5.9001 2.99998 7.0001H0.974976ZM5.29998 18.7251C3.78331 17.2084 3.02498 15.3834 3.02498 13.2501C3.02498 11.1168 3.78331 9.29176 5.29998 7.7751L7.04998 6.0001L7.34998 6.3001C7.83331 6.78343 8.07498 7.37093 8.07498 8.0626C8.07498 8.75426 7.83331 9.34176 7.34998 9.8251L6.99998 10.1751C6.79998 10.3751 6.69998 10.6126 6.69998 10.8876C6.69998 11.1626 6.79998 11.4001 6.99998 11.6001L7.89998 12.5001C8.33331 12.9334 8.54998 13.4584 8.54998 14.0751C8.54998 14.6918 8.33331 15.2168 7.89998 15.6501L8.97498 16.7251C9.70831 15.9918 10.075 15.1126 10.075 14.0876C10.075 13.0626 9.69998 12.1751 8.94998 11.4251L8.39998 10.8751C8.83331 10.4418 9.14164 9.95426 9.32498 9.4126C9.50831 8.87093 9.58331 8.31676 9.54998 7.7501L14.025 3.2751C14.225 3.0751 14.4625 2.9751 14.7375 2.9751C15.0125 2.9751 15.25 3.0751 15.45 3.2751C15.65 3.4751 15.75 3.7126 15.75 3.9876C15.75 4.2626 15.65 4.5001 15.45 4.7001L10.775 9.3751L11.825 10.4251L17.85 4.4251C18.05 4.2251 18.2833 4.1251 18.55 4.1251C18.8166 4.1251 19.05 4.2251 19.25 4.4251C19.45 4.6251 19.55 4.85843 19.55 5.1251C19.55 5.39176 19.45 5.6251 19.25 5.8251L13.25 11.8501L14.3 12.9001L19.6 7.6001C19.8 7.4001 20.0375 7.3001 20.3125 7.3001C20.5875 7.3001 20.825 7.4001 21.025 7.6001C21.225 7.8001 21.325 8.0376 21.325 8.3126C21.325 8.5876 21.225 8.8251 21.025 9.0251L15.725 14.3251L16.775 15.3751L20.825 11.3251C21.025 11.1251 21.2625 11.0251 21.5375 11.0251C21.8125 11.0251 22.05 11.1251 22.25 11.3251C22.45 11.5251 22.55 11.7626 22.55 12.0376C22.55 12.3126 22.45 12.5501 22.25 12.7501L16.25 18.7251C14.7333 20.2418 12.9083 21.0001 10.775 21.0001C8.64164 21.0001 6.81664 20.2418 5.29998 18.7251ZM17 23.0251V21.0001C18.1 21.0001 19.0416 20.6084 19.825 19.8251C20.6083 19.0418 21 18.1001 21 17.0001H23.025C23.025 18.6668 22.4375 20.0876 21.2625 21.2626C20.0875 22.4376 18.6666 23.0251 17 23.0251Z" fill="currentColor" /></g></svg>}
            />
          )}
          escapeHTML={false}
          limit={10}
          classNames={{
            root: 'mt-4',
            title:
              'text-3xl font-black text-[1.5rem] font-normal leading-[2rem] text-left text-gray-900',
            list: '!gap-4',
            item: 'mt-4 !p-0 !shadow-none !radius-none',
          }}
        />
      </div>
    </InstantSearchNext>
  );
  */
}
