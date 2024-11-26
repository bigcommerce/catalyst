'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import { useState, useEffect } from 'react';

import {
  Highlight,
  //LookingSimilar as AlgoliaRelatedProducts,
  RelatedProducts as AlgoliaRelatedProducts,
  //Carousel
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';

import noImage from '~/public/no-image.svg';

import { Carousel } from '~/components/ui/carousel2';
//import { ProductCard } from '~/components/product-card';

import { useFormatter } from 'next-intl';

const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

interface Props {
  productId: number;
}

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
);
const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

function getDiscount(price: number, sale: number): number | null {
  return price > 0 ? Math.floor(((price - sale) * 100) / price) : 0;
}

function CustomItem({ hit, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false }: any) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article className="product flex space-x-4 items-start h-full rounded-none border border-gray-300 p-4">
      <div className="flex-none w-full md:w-auto md:max-w-[150px] lg:max-w-[150px]">
        <div className="w-[150px] h-[150px] max-h-[150px]">
          <div className="flex my-0 mx-auto md:pb-full w-full md:h-auto md:overflow-hidden md:pb-[100%] relative">
            <figure className="md:absolute left-0 top-0 w-full h-full">
              <Link href={hit.url} className="w-full h-full flex justify-center items-center align-middle">
                {hit.image_url
                  ? <img src={imageUrl || ''} alt={hit.name} className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                  : <Image src={noImage} alt="No Image" className="inline-block m-auto w-auto h-auto max-h-full max-w-full relative align-middle" />
                }
              </Link>
            </figure>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-lg font-medium"><Link href={hit.url}><Highlight hit={hit} attribute="name" /></Link></h2>
          {useAsyncMode && !useDefaultPrices ? (
            <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center">
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
              <div className="mx-auto mt-2 flex flex-wrap space-x-2 items-center">
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
          <div className="mt-2 text-xs">ID: {hit.objectID}</div>
          <div className="mt-4">
            <button type="button" className="flex-none flex items-center space-x-2 px-4 h-10 rounded border border-gray-300 cursor-pointer" onClick={(e) => alert('Coming Soon!')}>
              <svg width="17" height="18" viewBox="0 0 17 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 12H12.565L11.9575 11.3925C12.625 10.5 13 9.375 13 8.25C13 5.3475 10.6525 3 7.75 3C6.625 3 5.5 3.375 4.5925 4.05C2.275 5.79 1.8025 9.0825 3.5425 11.4C5.2825 13.7175 8.575 14.19 10.8925 12.45L11.5 13.0575V13.5L15.25 17.25L16.75 15.75L13 12ZM7.75 12C5.68 12 4 10.32 4 8.25C4 6.18 5.68 4.5 7.75 4.5C9.82 4.5 11.5 6.18 11.5 8.25C11.5 10.32 9.82 12 7.75 12ZM1.75 4.5L0.25 6V0.75H5.5L4 2.25H1.75V4.5ZM15.25 0.75V6L13.75 4.5V2.25H11.5L10 0.75H15.25ZM4 14.25L5.5 15.75H0.25V10.5L1.75 12V14.25H4Z" fill="#353535"/>
              </svg>
              <span>Quick View</span></button>
            </div>
      </div>
    </article>
  );
}

export function RelatedProducts({ productId }: Props) {
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
          layoutComponent={(props) => (
            <Carousel
              pageSize={3}
              products={props.items.map((item) => (
                <CustomItem hit={item} useDefaultPrices={true} />
                /*
                <ProductCard imageSize="tall" key={item.objectID} product={{
                  entityId: Number(item.objectID),
                  name: item.name,
                  defaultImage: {
                    altText: item.name,
                    url: item.image_url
                  },
                  path: item.url,
                  brand: {
                    name: item.brand_name as string,
                    path: ''
                  }
                }} showCart={false} showCompare={false}
                />
                */
              ))}
              title="You May Also Need..."
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
}
