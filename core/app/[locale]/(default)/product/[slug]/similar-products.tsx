'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React from 'react';
import { useState, useEffect } from 'react';

import {
  Highlight,
  LookingSimilar as AlgoliaSimilarProducts
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';

import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';

import noImage from '~/public/no-image.svg';

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
  return price > 0 ? Math.round(((price - sale) * 100) / price) : 0;
}

function CustomItem({ hit, useDefaultPrices = false, price = null, salePrice = null, isLoading = false, isLoaded = false }: any) {

  const format = useFormatter();
  const currency = 'USD';

  const [imageUrl, _setImageUrl] = useState(hit.image_url ? hit.image_url.replace('.220.290.', '.386.513.') : null);

  function setImageUrl(value: string) {
    _setImageUrl(value);
  }

  return (
    <article className="product flex flex-col h-full rounded-none border border-gray-300 p-4">
      <div className="flex-none w-full">
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
      </div>
    </article>
  );
}

export function SimilarProducts({ productId }: Props) {
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
      <div className="mt-8">
        <AlgoliaSimilarProducts
          objectIDs={[productId.toString()]}
          headerComponent={() => <></>}
          layoutComponent={(props) => (
            <div className="flex items-center">
            {props.items.map((item) => (
                <CustomItem hit={item} useDefaultPrices={true} />
            ))}
            </div>
          )}
          escapeHTML={false}
          limit={5}
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
