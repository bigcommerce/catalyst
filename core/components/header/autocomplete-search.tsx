'use client';

import React, { createElement, Fragment, useEffect, useRef, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

import {
  autocomplete,
  getAlgoliaResults,
  getAlgoliaFacets,
  AutocompleteComponents
} from '@algolia/autocomplete-js';
import { liteClient as algoliasearch } from 'algoliasearch/lite';
import { Hit as AlgoliaHit } from '@algolia/client-search';
//import { Hit as AlgoliaHit } from 'instantsearch.js';
//import { Highlight } from 'react-instantsearch';
import { createQuerySuggestionsPlugin } from '@algolia/autocomplete-plugin-query-suggestions';
import '@algolia/autocomplete-theme-classic';
import insightsClient from 'search-insights';

import { ProductPrice } from '~/belami/components/search/product-price';
import { ReviewSummary } from '~/belami/components/reviews';

import Link from 'next/link';
import Image from 'next/image';
import noImage from '~/public/no-image.svg';

import { useFormatter } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';

const client = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
);
const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';
const indexName2: string = process.env.NEXT_PUBLIC_ALGOLIA_SUGGESTIONS_INDEX_NAME || '';

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
//const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';

insightsClient('init', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID,
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY,
  useCookie: true,
});

type HitPrice = {
  CAD: number;
  USD: number;
};

export type ProductRecord = {
  //categories: string[];
  comments: number;
  free_shipping: boolean;
  hierarchicalCategories: {
    lvl0: string;
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
    lvl4?: string;
    lvl5?: string;
    lvl6?: string;
  };
  popularity: number;
  prince_range: string;
  sale: boolean;
  sale_price: string;
  type: string;
  url: string;

  categories: {
    lvl0: string;
    lvl1?: string;
    lvl2?: string;
    lvl3?: string;
    lvl4?: string;
    lvl5?: string;
    lvl6?: string;
  };
  name: string;
  brand: string;
  brand_id: number;
  brand_name: string;
  sku: string;
  category_ids: Array<number>;
  image: string;
  image_url: string;
  price: number;
  prices: HitPrice;
  sales_prices: HitPrice;
  retail_prices: HitPrice;
  rating: number;
  onSale: boolean;
  newPrice: number;
  description: string;
  objectID: number;
  reviews_rating_sum: number;
  reviews_count: number;
  metafields: any;
  variants: any;

  __autocomplete_indexName: any;
  __autocomplete_queryID: any;
};

type HitProps = {
  hit: AlgoliaHit<ProductRecord>,
  priceMaxRules?: any,
  components: AutocompleteComponents,
  insights?: any,
  useDefaultPrices?: boolean,
  price?: number | null,
  salePrice?: number | null,
  isLoading?: boolean,
  isLoaded?: boolean,
  format?: any,
  currency?: string
};

type PriceItem = {
  price: number;
  sale_price: number;
};

function debouncePromise(fn: any, time: number) {
  let timer: NodeJS.Timeout | string | number | undefined = undefined;

  return function debounced(...args: any[]) {
    if (timer) {
      clearTimeout(timer); // Clear the timeout first if it's already defined.
    }

    return new Promise((resolve) => {
      timer = setTimeout(() => resolve(fn(...args)), time);
    });
  };
}

function ProductItem({
  hit,
  priceMaxRules = null,
  components,
  insights,
  useDefaultPrices = false,
  price = null,
  salePrice = null,
  isLoading = false,
  isLoaded = false,
  format,
  currency
}: HitProps) {

  return (
    <Link href={hit.url} className="aa-ItemLink py-1">
      <div className="aa-ItemContent !items-start">
        <div className="h-40 w-40">
          <div className="p-2">
            <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
              <div className="absolute left-0 top-0 h-full w-full">
                <figure className="flex h-full w-full items-center justify-center align-middle">
                  {hit.image_url ? (
                    <img
                      src={hit.image_url}
                      alt={hit.name}
                      className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                    />
                  ) : (
                    <Image
                      src={noImage}
                      alt="No Image"
                      className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                    />
                  )}
                </figure>
              </div>
            </div>
          </div>
        </div>

        <div className="aa-ItemContentBody">
          <h2 className="aa-ItemContentTitle mt-2 text-md font-medium">
            <components.Highlight hit={hit} attribute="name" />
          </h2>

          {hit.categories && hit.categories.lvl0 ? (
            <div className="aa-ItemContentDescription">In <strong>{hit.categories.lvl0}</strong></div>
          ) : null}

          {/*
          <div className="aa-ItemContentDescription">
            By <strong>{hit.brand_name}</strong>{' '}
            {hit.categories && hit.categories.lvl0 ? (
              <>
                in <strong>{hit.categories.lvl0}</strong>
              </>
            ) : null}
          </div>
          */}

          <ProductPrice 
            defaultPrice={hit?.prices?.USD || 0} 
            defaultSalePrice={hit?.sales_prices?.USD || null} 
            price={price}
            salePrice={salePrice}
            priceMaxRule={priceMaxRules?.find((r: any) => (r.bc_brand_ids && r.bc_brand_ids.includes(hit?.brand_id)) || (r.skus && r.skus.includes(hit?.sku)))}
            currency={currency}
            format={format}
            options={{
              useAsyncMode: !useDefaultPrices,
              useDefaultPrices: useDefaultPrices,
              isLoading: isLoading,
              isLoaded: isLoaded
            }}
            classNames={{
              root: 'flex items-center space-x-2',
              discount: 'font-bold text-brand-400',
            }}
          />

          {/*
          {!useDefaultPrices ? (
            <div className="flex items-center space-x-2">
              {!isLoading && (price || salePrice) ? (
                <>
                  {salePrice && salePrice > 0 ? (
                    <s>{format.number(price || 0, { style: 'currency', currency: currency })}</s>
                  ) : (
                    <span>
                      {format.number(price || 0, { style: 'currency', currency: currency })}
                    </span>
                  )}
                  {price && salePrice && salePrice > 0 ? (
                    <strong className="font-bold text-brand-400">
                      Save {getDiscount(price, salePrice)}%
                    </strong>
                  ) : null}
                  {salePrice && salePrice > 0 ? (
                    <span>
                      {format.number(salePrice || 0, { style: 'currency', currency: currency })}
                    </span>
                  ) : null}
                </>
              ) : !isLoading && isLoaded ? (
                hit.prices ? (
                  <div className="flex items-center space-x-2">
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.onSale ? (
                      <s>
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </s>
                    ) : (
                      <span>
                        {format.number(hit.prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    )}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.onSale ? (
                      <strong className="font-bold text-brand-400">
                        Save{' '}
                        {getDiscount(
                          hit.prices.USD ?? hit.price,
                          hit.sales_prices.USD ?? hit.newPrice,
                        )}
                        %
                      </strong>
                    ) : null}
                    {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
                    hit.onSale ? (
                      <span>
                        {format.number(hit.sales_prices.USD || 0, {
                          style: 'currency',
                          currency: currency,
                        })}
                      </span>
                    ) : null}
                  </div>
                ) : null
              ) : (
                'Loading...'
              )}
            </div>
          ) : hit.prices ? (
            <div className="flex items-center space-x-2">
              {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
              hit.onSale ? (
                <s>
                  {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                </s>
              ) : (
                <span>
                  {format.number(hit.prices.USD || 0, { style: 'currency', currency: currency })}
                </span>
              )}
              {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
              hit.onSale ? (
                <strong className="font-bold text-brand-400">
                  Save{' '}
                  {getDiscount(hit.prices.USD ?? hit.price, hit.sales_prices.USD ?? hit.newPrice)}%
                </strong>
              ) : null}
              {(hit.sales_prices && hit.sales_prices.USD && hit.sales_prices.USD > 0) ||
              hit.onSale ? (
                <span>
                  {format.number(hit.sales_prices.USD || 0, {
                    style: 'currency',
                    currency: currency,
                  })}
                </span>
              ) : null}
            </div>
          ) : null}
          */}

          {hit.reviews_count > 0 &&
            <ReviewSummary numberOfReviews={hit.reviews_count} averageRating={hit.reviews_rating_sum} className="aa-ItemContentDescription" />
          }
        </div>
      </div>
      {/*
      <div className="aa-ItemActions px-2">
        <button
          className="aa-ItemActionButton aa-DesktopOnly aa-ActiveOnly"
          type="button"
          title="Select"
          disabled={true}
          style={{ pointerEvents: 'none' }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.984 6.984h2.016v6h-15.188l3.609 3.609-1.406 1.406-6-6 6-6 1.406 1.406-3.609 3.609h13.172v-4.031z" />
          </svg>
        </button>
        <button
          className="aa-ItemActionButton"
          type="button"
          title="Add to cart"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            insights.convertedObjectIDsAfterSearch({
              eventName: 'Added to cart',
              index: hit.__autocomplete_indexName,
              objectIDs: [hit.objectID],
              queryID: hit.__autocomplete_queryID,
              objectData: [
                {
                  // The discount value for this item, if applicable
                  discount: 0,
                  // The price value for this item (minus the discount)
                  price: hit.prices.USD,
                  // How many of this item were added
                  quantity: 1,
                },
              ],
              // The total value of all items
              value: hit.prices.USD,
              // The currency code
              currency: 'USD',
            });
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-14l1.5-2h11zM21.794 5.392l-2.994-3.992c-0.196-0.261-0.494-0.399-0.8-0.4h-12c-0.326 0-0.616 0.156-0.8 0.4l-2.994 3.992c-0.043 0.056-0.081 0.117-0.111 0.182-0.065 0.137-0.096 0.283-0.095 0.426v14c0 0.828 0.337 1.58 0.879 2.121s1.293 0.879 2.121 0.879h14c0.828 0 1.58-0.337 2.121-0.879s0.879-1.293 0.879-2.121v-14c0-0.219-0.071-0.422-0.189-0.585-0.004-0.005-0.007-0.010-0.011-0.015zM4 7h16v13c0 0.276-0.111 0.525-0.293 0.707s-0.431 0.293-0.707 0.293h-14c-0.276 0-0.525-0.111-0.707-0.293s-0.293-0.431-0.293-0.707zM15 10c0 0.829-0.335 1.577-0.879 2.121s-1.292 0.879-2.121 0.879-1.577-0.335-2.121-0.879-0.879-1.292-0.879-2.121c0-0.552-0.448-1-1-1s-1 0.448-1 1c0 1.38 0.561 2.632 1.464 3.536s2.156 1.464 3.536 1.464 2.632-0.561 3.536-1.464 1.464-2.156 1.464-3.536c0-0.552-0.448-1-1-1s-1 0.448-1 1z" />
          </svg>
        </button>
      </div>
      */}
    </Link>
  );
}

function getDiscount(price: number, salePrice: number): number | null {
  return price > 0 ? Math.round(((price - salePrice) * 100) / price) : 0;
}

function getCookieValue(name: string): string | null {
  if (typeof document !== 'undefined') {
    const cookies = document.cookie.split('; ');
    for (const cookie of cookies) {
        const [cookieName, cookieValue] = cookie.split('=');
        if (cookieName === name && cookieValue) {
            return decodeURIComponent(cookieValue);
        }
    }
  }
  return null;
}

export function AutocompleteSearch({ useDefaultPrices = false, priceMaxRules = null, userContext = null }: { useDefaultPrices?: boolean, priceMaxRules?: any, userContext?: any }) {

  /*
  const searchParams = useSearchParams();

  const priceMaxCookieValue = getCookieValue('pmx');
  const priceMaxTriggers = priceMaxCookieValue 
    ? JSON.parse(atob(priceMaxCookieValue)) 
    : undefined;
  */

  const containerRef = useRef(null);
  const panelRoot = useRef(null);

  const router = useRouter();

  const format = useFormatter();
  const currency = 'USD';

  const [autocompleteState, setAutocompleteState] = useState({});

  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cachedPrices, setCachedPrices] = useState({} as any);

  const debounced = debouncePromise((items: any) => Promise.resolve(items), 500);

  const ruleContexts = [];
  if (userContext?.isCaliforniaIp)
    ruleContexts.push('california-ip');
  if (userContext?.isBot)  
    ruleContexts.push('bot');
  if (!userContext?.isGuest)  
    ruleContexts.push('user')
  else
    ruleContexts.push('guest');

  const analyticsTags = [userContext?.isBot ? 'bot' : (!userContext?.isGuest ? 'user' : 'guest')];

  useEffect(() => {
    if (!containerRef.current) {
      return undefined;
    }
   
    // Create the Query Suggestions plugin
    const querySuggestionsPlugin = createQuerySuggestionsPlugin({
      searchClient: client,
      indexName: indexName2,
      getSearchParams({ state }) {
        return { clickAnalytics: true, hitsPerPage: state.query ? 3 : 10 };
      },
      categoryAttribute: ['instant_search', 'facets', 'exact_matches', 'categories'],
      itemsWithCategories: 1,
      categoriesPerItem: 2,
      transformSource({ source, onTapAhead }) {
        return {
          ...source,
          /*
          onSelect({ item }) {
            // Assuming the `setSearchState` function updates the search page state.
            setSearchState({ query: item.query });
          },
          */
          getItemUrl({ item }: any) {
            return `/search?query=${item.query}`;
          },
          templates: {
            header({ items }: any) {
              if (items.length === 0) {
                return null;
              }
  
              return (
                <>
                  <span className="aa-SourceHeaderTitle">Popular Searches</span>
                  <div className="aa-SourceHeaderLine" />
                </>
              );
            },
            item(params: any) {
              const { item, components } = params;
              /*
              return (
                <a className="aa-ItemLink" href={`/search?query=${item.query}`}>
                  {source.templates.item(params).props.children}
                </a>
              );
              */
              return (
                <a className="aa-ItemLink" title={`Search website with query "${item.query}"`} href={`/search?query=${item.query}`}>
                  <div className="aa-ItemContent">
                    <div className="aa-ItemIcon aa-ItemIcon--noBorder">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"/>
                      </svg>
                    </div>
                    <div className="aa-ItemContentBody">
                      <div className="aa-ItemContentTitle">
                        <components.Highlight hit={item} attribute="query" />
                      </div>
                    </div>
                  </div>
                  <div className="aa-ItemActions">
                    <button type="button" title={`Fill query with "${item.query}"`} className="aa-ItemActionButton" onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onTapAhead(item);
                    }}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 17v-7.586l8.293 8.293c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414l-8.293-8.293h7.586c0.552 0 1-0.448 1-1s-0.448-1-1-1h-10c-0.552 0-1 0.448-1 1v10c0 0.552 0.448 1 1 1s1-0.448 1-1z"/>
                    </svg>
                    </button>
                  </div>
                </a>
              );
            },
          },
        };
      },
    });

    const search = autocomplete({
      container: '#autocomplete',
      placeholder: 'What can we help you find?',
      plugins: [querySuggestionsPlugin],
      insights: true,
      renderer: {
        createElement,
        Fragment,
        render: () => {},
      },
      /*
      render({ children }: any, root: any) {
        if (!panelRoot.current) {
          panelRoot.current = createRoot(root) as any;
        }

        (panelRoot.current! as any).render(children);
      },
      */
      render({ state, elements }: any, root: any) {
        const { querySuggestionsPlugin, productsCategories, products } = elements;

        if (!panelRoot.current) {
          panelRoot.current = createRoot(root) as any;
        }

        (panelRoot.current! as any).render(
          <div className="aa-PanelLayout aa-Panel--scrollable !h-auto !max-h-none">
            <div className="aa-PanelSections flex flex-col md:flex-row md:space-x-8 space-y-8 md:space-y-0">
              <div className="aa-PanelSection--left md:flex-none md:max-w-72 flex-col space-y-8">
                {querySuggestionsPlugin}
                {productsCategories}
              </div>
              <div className="aa-PanelSection--right md:flex-1">
                {products}
              </div>
            </div>
            <a className="mt-4 mb-4 md:mb-0 flex items-center justify-center w-full text-center space-x-2 px-4 h-10 bg-white hover:bg-gray-50 uppercase rounded border border-brand-400" href={`/search?query=${state.query}`}>View All Results</a>
          </div>
        );
      },

      openOnFocus: false,
      autoFocus: true,

      /*
      onStateChange({ state }) {
        //console.log('The Autocomplete state has changed:', state);
        // Synchronize the Autocomplete state with the React state. (Doesn't work!!!)
        setAutocompleteState(state);
      },
      */

      getSources({ query, setContext }: any): any {
        if (!query) {
          return [];
        }

        return debounced([
          {
            sourceId: 'products',
            getItems({ query, state }: { query: any; state: any }) {
              return getAlgoliaResults<ProductRecord>({
                searchClient: client,
                queries: [
                  {
                    indexName: indexName,
                    query,
                    params: {
                      clickAnalytics: true,
                      attributesToSnippet: ['name:10', 'description:35'],
                      snippetEllipsisText: '…',
                      ruleContexts: ruleContexts,
                      analyticsTags: analyticsTags
                    },
                  } as any,
                ],
                transformResponse({ results, hits }: any) {
                  const [resultHits] = hits;
                  const skus: string[] = resultHits.map((hit: any) => hit.sku);

                  if (!useDefaultPrices) {
                    if (!state || !state.context || !state.context.isLoading) {
                      if (
                        !state ||
                        !state.context ||
                        !state.context.cachedPrices ||
                        !state.context.cachedPrices[skus.join(',')]
                      ) {
                        setContext({
                          isLoading: true,
                          isLoaded: false,
                        });
                        //console.log(skus.join(','));
                        fetch('/api/prices/?skus=' + skus.join(','))
                          .then((response) => {
                            if (!response.ok) {
                              throw new Error('Network response was not ok');
                            }
                            return response.json();
                          })
                          .then((data) => {
                            console.log(data);
                            setContext({
                              isLoading: false,
                              isLoaded: true,
                              cachedPrices: {
                                ...state.context.cachedPrices,
                                [skus.join(',')]: data.data,
                              },
                              prices: data.data,
                            });
                          })
                          .catch((error) => {
                            console.error('Error fetching data: ', error);
                            setContext({
                              isLoading: false,
                              isLoaded: true,
                            });
                          })
                          .finally(() => {});
                      } else {
                        setContext({
                          isLoading: false,
                          isLoaded: true,
                          prices: state.context.cachedPrices[skus.join(',')],
                        });
                      }
                    }
                  }

                  return resultHits;
                },
              });
            },
            templates: {
              header() {
                return (
                  <Fragment>
                    <span className="aa-SourceHeaderTitle">Top Product Matches</span>
                    <div className="aa-SourceHeaderLine" />
                  </Fragment>
                );
              },
              item({ item, components, state }: { item: any; components: any; state: any }) {
                return (
                  <ProductItem
                    hit={item as any}
                    components={components}
                    insights={(state?.context?.algoliaInsightsPlugin as any).insights}
                    priceMaxRules={priceMaxRules}
                    useDefaultPrices={useDefaultPrices}
                    price={
                      item.sku &&
                      state?.context?.prices &&
                      state?.context?.prices[item.sku] &&
                      state?.context?.prices[item.sku].price
                        ? state?.context?.prices[item.sku].price
                        : null
                    }
                    salePrice={
                      item.sku &&
                      state?.context?.prices &&
                      state?.context?.prices[item.sku] &&
                      state?.context?.prices[item.sku].salePrice
                        ? state?.context?.prices[item.sku].salePrice
                        : null
                    }
                    isLoading={state?.context?.isLoading ?? false}
                    isLoaded={state?.context?.isLoaded ?? false}
                    format={format}
                    currency={currency}
                  />
                );
              },
              noResults() {
                return 'No results found for this query.';
              },
            },
          },
          {
            sourceId: 'productsCategories',
            getItems({ query }: { query: any }) {
              // use the product categories as facets
              return getAlgoliaFacets({
                searchClient: client,
                queries: [
                  {
                    indexName: indexName,
                    facet: 'categories.lvl0',
                    params: {
                      facetQuery: query,
                      maxFacetHits: 3,
                    },
                  } as any,
                  {
                    indexName: indexName,
                    facet: 'categories.lvl1',
                    params: {
                      facetQuery: query,
                      maxFacetHits: 3,
                    },
                  } as any,
                  {
                    indexName: indexName,
                    facet: 'categories.lvl2',
                    params: {
                      facetQuery: query,
                      maxFacetHits: 3,
                    },
                  } as any,
                ],
              });
            },
            // Control the rendering of the product categories
            templates: {
              header() {
                return (
                  // Show 'Product Categories' before the actual categories
                  <Fragment>
                    <span className="aa-SourceHeaderTitle">Top Category Results</span>
                    <div className="aa-SourceHeaderLine" />
                  </Fragment>
                );
              },
              item({ item, components }: any) {
                const labelParts = item.label ? item.label.split(' > ') : null;
                /*
                return labelParts 
                  ? <a className="aa-ItemLink" href={`/c/${labelParts[labelParts.length - 1].replace(' ', '-').toLowerCase()}`}>{item.label}</a> 
                  : <div className="aa-ItemWrapper">{item.label}</div>;
                */

                return labelParts 
                  ? <a className="aa-ItemLink" title={`Navigate to category "${labelParts[labelParts.length - 1]}"`} href={`/c/${labelParts[labelParts.length - 1].replace(' ', '-').toLowerCase()}`}><div className="aa-ItemContent"><div className="aa-ItemContentTitle"><components.Highlight hit={item} attribute="label" /></div></div></a> 
                  : <div className="aa-ItemWrapper"><div className="aa-ItemContent"><div className="aa-ItemContentTitle"><components.Highlight hit={item} attribute="label" /></div></div></div>;

              },
            },
          },
        ]);
      },
      onSubmit: (params: any) => {
        search.setQuery('');
        router.push(`/search?query=${params.state?.query ?? ''}`);
      },
    });

    return () => {
      search.destroy();
    };
  }, []);

  return <div ref={containerRef} id="autocomplete" className="flex-auto xl:w-[650px] 2xl:w-[900px] absolute top-20 w-[93%] left-4 md:left-[2em] lg:left-[3em] xl:static" />;
}

export function AutocompleteSearchSkeleton() {
  return (
    <div id="autocomplete" className="flex-auto lg:w-96">
      <div className="aa-Autocomplete">
        <div className="aa-Form">
          <div className="aa-InputWrapperPrefix">
            
          {/* <label className="aa-Label" aria-label="Submit" htmlFor="autocomplete-1-input" id="autocomplete-1-label">
            <button className="aa-SubmitButton" type="submit" title="Submit"><svg className="aa-SubmitIcon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16.041 15.856c-0.034 0.026-0.067 0.055-0.099 0.087s-0.060 0.064-0.087 0.099c-1.258 1.213-2.969 1.958-4.855 1.958-1.933 0-3.682-0.782-4.95-2.050s-2.050-3.017-2.050-4.95 0.782-3.682 2.050-4.95 3.017-2.050 4.95-2.050 3.682 0.782 4.95 2.050 2.050 3.017 2.050 4.95c0 1.886-0.745 3.597-1.959 4.856zM21.707 20.293l-3.675-3.675c1.231-1.54 1.968-3.493 1.968-5.618 0-2.485-1.008-4.736-2.636-6.364s-3.879-2.636-6.364-2.636-4.736 1.008-6.364 2.636-2.636 3.879-2.636 6.364 1.008 4.736 2.636 6.364 3.879 2.636 6.364 2.636c2.125 0 4.078-0.737 5.618-1.968l3.675 3.675c0.391 0.391 1.024 0.391 1.414 0s0.391-1.024 0-1.414z"></path></svg></button>
          </label> */}
         
            <div className="aa-LoadingIndicator">
              <svg className="aa-LoadingIcon" viewBox="0 0 100 100" width="20" height="20">
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="35"
                  stroke="currentColor"
                  strokeDasharray="164.93361431346415 56.97787143782138"
                  strokeWidth="6"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    repeatCount="indefinite"
                    dur="1s"
                    values="0 50 50;90 50 50;180 50 50;360 50 50"
                    keyTimes="0;0.40;0.65;1"
                  ></animateTransform>
                </circle>
              </svg>
            </div>
          </div>
          <div className="aa-InputWrapper">
            <input className="aa-Input" placeholder="Search for products" type="search" />
          </div>
        </div>
      </div>
    </div>
  );
}
