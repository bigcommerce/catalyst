'use client';

import { liteClient as algoliasearch } from 'algoliasearch/lite';
import React, { useState, useLayoutEffect } from 'react';
import {
  Configure,
  RefinementList,
  ToggleRefinement,
  HierarchicalMenu,
  DynamicWidgets,
  RangeInput,
  HitsPerPage,
  //Pagination,
  SortBy,
  Stats,
  useSearchBox
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import type { RefinementListProps } from 'react-instantsearch';

import { Panel } from '../_components/panel';
import { RatingMenu } from '../_components/rating-menu';
import { Hits, HitsAsync } from '../_components/hits';
import { ClearRefinements } from '../_components/clear-refinements';
import { CurrentRefinements } from '../_components/current-refinements';
import { Pagination } from '../_components/pagination';

import { Facet } from '../_components/facet';
import { FacetDropdown } from '../_components/facet-dropdown';

import { createFallbackableCache } from "@algolia/cache-common";
import { createInMemoryCache } from "@algolia/cache-in-memory";
import { createBrowserLocalStorageCache } from "@algolia/cache-browser-local-storage";

import { cn } from '~/lib/utils';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
  {
    // Caches responses from Algolia
    responsesCache: createFallbackableCache({
      caches: [
        createBrowserLocalStorageCache({ key: `${process.env.NEXT_PUBLIC_ALGOLIA_VERSION}-${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID}` }),
        createInMemoryCache()
      ]
    })
  }
);
const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';
//const useAsyncMode = false;

const sortByNumericName: RefinementListProps['sortBy'] = (a: any, b: any) => {
  return parseInt(a.name) < parseInt(b.name) ? -1 : 1;
};

const closeOnChange = () => window.innerWidth > 375;

export const Search = ({ query, promotions, useDefaultPrices = false }: any) => {

  const [view, setView] = useState('grid');

  const [showSidebar, _setShowSidebar] = useState(false);
  const [showViewResultsButton, setShowViewResultsButton] = useState(false);

  function setShowSidebar(value: boolean) {
    _setShowSidebar(value);
    setShowViewResultsButton(false);
  }

  useLayoutEffect(() => {
    if (typeof (Storage) !== 'undefined')
      setView(localStorage.getItem('algolia-results-view') === 'list' ? 'list' : 'grid');
  }, []);

  function toggleView() {
    const currentValue = view;
    setView(currentValue === 'grid' ? 'list' : 'grid');

    if (typeof (Storage) !== 'undefined')
      localStorage.setItem('algolia-results-view', currentValue === 'grid' ? 'list' : 'grid');
  }

  function VirtualSearchBox(props: any) {
    const {
      query,
      refine,
      clear,
      // Deprecated
      isSearchStalled,
    } = useSearchBox(props);
  
    return <></>;
  }

  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      routing={{
        router: {
          cleanUrlOnDispose: false
        },
        stateMapping: {
          stateToRoute(uiState: any) {
            const indexUiState = uiState[indexName];
            console.log(indexUiState);
            return {
              query: indexUiState.query,
              categories: indexUiState.hierarchicalMenu?.['categories.lvl0'],
              brand_name: indexUiState.refinementList?.brand_name,
              collection: indexUiState.refinementList?.['metafields.Akeneo.collection'],
              finish_color: indexUiState.refinementList?.['variants.options.Finish Color'],
              number_of_bulbs: indexUiState.refinementList?.['metafields.Akeneo.number_of_bulbs'],
              product_style: indexUiState.refinementList?.['metafields.Akeneo.product_style'],
              on_sale: indexUiState.toggle?.['on_sale'] === null || indexUiState.toggle?.['on_sale'] === undefined ? undefined : indexUiState.toggle?.['on_sale'] as any,
              is_new: indexUiState.toggle?.['is_new'] === null || indexUiState.toggle?.['is_new'] === undefined ? undefined : indexUiState.toggle?.['is_new'] as any,
              page: indexUiState.page,
              hitsPerPage: indexUiState.hitsPerPage,
              sortBy: indexUiState.sortBy,
            };
          },
          routeToState(routeState: any) {
            console.log(routeState);
            return {
              [indexName]: {
                query: routeState?.query,
                hierarchicalMenu: {
                  'categories.lvl0': routeState?.categories
                },
                refinementList: {
                  'brand_name': routeState?.brand_name,
                  'metafields.Akeneo.collection': routeState?.collection,
                  'variants.options.Finish Color': routeState?.finish_color,
                  'metafields.Akeneo.number_of_bulbs': routeState?.number_of_bulbs,
                  'metafields.Akeneo.product_style': routeState?.product_style
                },
                toggle: {
                  'on_sale': routeState?.on_sale == null || routeState?.on_sale == undefined ? undefined : (routeState?.on_sale === 'true' || routeState?.on_sale === true),
                  'is_new': routeState?.is_new == null || routeState?.is_new == undefined ? undefined : (routeState?.is_new === 'true' || routeState?.is_new === true),
                },
                page: routeState?.page,
                hitsPerPage: routeState?.hitsPerPage,
                sortBy: routeState?.sortBy
              },
            };
          },
        }
      }}
      onStateChange={({
        uiState,
        setUiState,
      }: {
        uiState: any;
        setUiState: any;
      }) => {
        if (showSidebar) {
          setShowViewResultsButton(true);
        }
        setUiState(uiState);
      }}
      future={{ preserveSharedStateOnUnmount: true }}
      insights={true}
    >
      <Configure maxFacetHits={100} />
      <VirtualSearchBox />
      {showSidebar &&
        <div className="hidden sm:block fixed inset-0 w-full h-full pointer-events-auto z-[9995] bg-black bg-opacity-60 backdrop-blur-sm opacity-100" onClick={() => setShowSidebar(false)}></div>
      }
      <aside className={cn(
        'fixed p-4 z-[9999] pointer-events-auto bg-white box-border w-full top-0 left-0 facets sm:max-w-[320px] max-h-full h-screen duration-300 ease-in-out overflow-y-auto',
        showSidebar ? 'shadow-2xl shadow-blue-gray-900/10 translate-x-0' : '-translate-x-full'
      )}>
        <button type="button" onClick={() => setShowSidebar(false)} className="mx-auto flex text-xl justify-center">✕</button>
        <h3 className="text-center text-2xl medium">Filter and Sort</h3>

        {showViewResultsButton &&
          <button type="button" className="mt-4 block md:hidden w-full text-center space-x-2 px-4 h-10 bg-brand-600 uppercase text-white rounded border border-brand-600 cursor-pointer" onClick={() => setShowSidebar(false)}>View Results</button>
        }

        <div className="mt-4 flex flex-col">

          <div className="mt-4 order-2">
            <Facet title="Category">
              <HierarchicalMenu attributes={[
                'categories.lvl0',
                'categories.lvl1',
                'categories.lvl2',
                'categories.lvl3'
              ]} />
            </Facet>
            <DynamicWidgets maxValuesPerFacet={1000}>
              <Facet title="Brand">
                <RefinementList attribute="brand_name" searchable={false} />
              </Facet>
              <Panel header="Brand">
                <RefinementList attribute="brand_name" />
              </Panel>
              <Facet title="Collection">
                <RefinementList attribute="metafields.Akeneo.collection" />
              </Facet>
              <Facet title="Finish Color">
                <RefinementList attribute="variants.options.Finish Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Panel header="Glass Color">
                <RefinementList attribute="variants.options.Glass Color" searchable={true} searchablePlaceholder="Quick Lookup" />
              </Panel>
              <Panel header="Shade Color">
                <RefinementList attribute="variants.options.Shade Color" searchable={true} searchablePlaceholder="Quick Lookup" />
              </Panel>
              <Panel header="Blade Color">
                <RefinementList attribute="variants.options.Blade Color" searchable={true} searchablePlaceholder="Quick Lookup" />
              </Panel>
              <Facet title="Number of Lights">
                <RefinementList attribute="metafields.Akeneo.number_of_bulbs"
                  sortBy={sortByNumericName}
                  limit={20}
                  showMore={true}
                  showMoreLimit={40}
                  classNames={{
                    root: 'numbers-of-lights',
                    list: 'grid grid-cols-4 gap-4 max-w-64',
                    item: 'flex m-0 p-0',
                    label: 'flex relative m-0 p-0',
                    checkbox: 'peer left-0 top-0 !m-0 !w-full !h-full absolute appearance-none !rounded-none !bg-transparent !bg-none !shadow-none !border-brand-300',
                    labelText: 'w-full py-1 px-2 inline-flex items-center justify-center text-sm font-medium cursor-pointer text-gray-900 focus:outline-none bg-white border border-brand-300 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 bg-blue-50 text-brand-700 peer-hover:bg-gray-100 peer-hover:text-primary-700 peer-checked:bg-gray-100 peer-checked:text-primary-700',
                    count: '!hidden'
                  }} />
              </Facet>
              <Facet title="Style">
                <RefinementList attribute="metafields.Akeneo.product_style" />
              </Facet>
              <Facet title="Fuel Source">
                <RefinementList attribute="metafields.Akeneo.fuel_source" />
              </Facet>
              <Facet title="Mounting Options">
                <RefinementList attribute="metafields.Akeneo.mounting_options" />
              </Facet>
              <Facet title="Voltage Rating">
                <RefinementList attribute="metafields.Akeneo.voltage" />
              </Facet>
              <Facet title="Shape">
                <RefinementList attribute="metafields.Akeneo.product_shape" />
              </Facet>
              <Panel header="Price">
                <RangeInput attribute="prices.USD" classNames={{ input: 'max-w-[80px]' }} />
              </Panel>
              <Panel header="Price">
                <RangeInput attribute="prices.USD" classNames={{ input: 'max-w-[80px]' }} />
              </Panel>
              <Facet title="Weight">
                <RefinementList attribute="metafields.Akeneo.weight" searchable={false} />
              </Facet>
              <Panel header="Rating">
                <RatingMenu attribute="rating" />
              </Panel>
              <Panel header="Free Shipping">
                <ToggleRefinement attribute="free_shipping" label="Free Shipping" />
              </Panel>
              <Panel header="Is New">
                <ToggleRefinement attribute="is_new" label="Is New" />
              </Panel>
              <Panel header="On Sale">
                <ToggleRefinement attribute="on_sale" label="On Sale" />
              </Panel>
              <Panel header="On Clearance">
                <ToggleRefinement attribute="on_clearance" label="On Clearance" />
              </Panel>
              <Panel header="In Stock">
                <ToggleRefinement attribute="in_stock" label="In Stock" />
              </Panel>
            </DynamicWidgets>
          </div>
          <SortBy items={[
            { label: 'Relevance', value: indexName },
            { label: 'Price (Low to High)', value: `${indexName}_sort_prices_USD_asc` },
            { label: 'Price (High to Low)', value: `${indexName}_sort_prices_USD_desc` },
            { label: 'Avg. Customer Rating', value: `${indexName}_reviews_rating_sum_desc` },
            { label: 'Number of Reviews', value: `${indexName}_reviews_count_desc` },
            { label: 'Best Sellers', value: `${indexName}_total_sold_desc` }
          ]} classNames={{ root: 'order-1' }} />
        </div>
      </aside>

      <div className={showSidebar ? 'overflow-hidden h-0 sm:overflow-auto sm:h-auto' : ''}>

        <div className="mt-2 lg:flex md:space-x-4 items-center">
          <div className="flex-1">
            <Stats
              translations={{
                rootElementText({ nbHits, processingTimeMS, nbSortedHits, areHitsSorted }: {
                  nbHits: number,
                  processingTimeMS: number,
                  nbSortedHits: number,
                  areHitsSorted: boolean
                }) {
                  return areHitsSorted && nbHits !== nbSortedHits
                    ? `${nbSortedHits!.toLocaleString()} relevant results sorted out of ${nbHits.toLocaleString()} found in ${processingTimeMS.toLocaleString()}ms`
                    : `${nbHits.toLocaleString()} results found in ${processingTimeMS.toLocaleString()}ms`;
                },
              }}
              classNames={{ root: 'flex-none text-center lg:text-left' }}
            />
          </div>

          <div className="mt-2 lg:mt-0 flex-1 hidden lg:flex space-x-4 items-center">
            <button type="button" className="flex-none md:ml-auto flex items-center space-x-2 px-4 h-10 rounded border border-gray-300 cursor-pointer" onClick={() => toggleView()}>
              <span>View:</span>
              {view === 'list' &&
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V6H12V2H8ZM14 2V6H18V2H14ZM14 8V12H18V8H14ZM14 14V18H18V14H14ZM12 18V14H8V18H12ZM6 18V14H2V18H6ZM6 12V8H2V12H6ZM6 6V2H2V6H6ZM8 12H12V8H8V12ZM2 0H18C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H2C0.92 20 0 19.1 0 18V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0Z" fill="black" /></svg>
              }
              {view === 'grid' &&
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.05882 0V5.71429H24V0M7.05882 20H24V14.2857H7.05882M7.05882 12.8571H24V7.14286H7.05882M0 5.71429H5.64706V0H0M0 20H5.64706V14.2857H0M0 12.8571H5.64706V7.14286H0V12.8571Z" fill="black" /></svg>
              }
            </button>

            <SortBy items={[
              { label: 'Relevance', value: indexName },
              { label: 'Price (Low to High)', value: `${indexName}_sort_prices_USD_asc` },
              { label: 'Price (High to Low)', value: `${indexName}_sort_prices_USD_desc` },
              { label: 'Avg. Customer Rating', value: `${indexName}_reviews_rating_sum_desc` },
              { label: 'Number of Reviews', value: `${indexName}_reviews_count_desc` },
              { label: 'Best Sellers', value: `${indexName}_total_sold_desc` }
            ]} classNames={{ root: 'flex-none', select: '!shadow-none !border-gray-300' }} />
          </div>
        </div>

        <div className="mt-8 lg:mt-4 flex items-center space-x-4">
          <button type="button" className="w-full lg:w-auto flex items-center justify-center space-x-2 px-4 h-10 bg-brand-600 uppercase whitespace-nowrap text-white rounded border border-brand-600 cursor-pointer hover:bg-brand-400 hover:border-brand-400" onClick={() => setShowSidebar(true)}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g><path d="M11 21V15H13V17H21V19H13V21H11ZM3 19V17H9V19H3ZM7 15V13H3V11H7V9H9V15H7ZM11 13V11H21V13H11ZM15 9V3H17V5H21V7H17V9H15ZM3 7V5H13V7H3Z" fill="white" /></g></svg>
            <span className="hidden lg:inline">All Filters</span>
            <span className="inline lg:hidden">Filter And Sort</span>
          </button>
          <div className="hidden lg:flex lg:w-full lg:items-center lg:space-x-4">
            {/* <DynamicWidgets maxValuesPerFacet={1000}> */}
              {/* Lighting: Brand, Collection, Finish, Number of lights, Style */}
              <FacetDropdown buttonText="Brand" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="brand_name" searchable={true} limit={10} showMore={true} showMoreLimit={100} />
              </FacetDropdown>
              <FacetDropdown buttonText="Collection" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.collection" limit={10} showMore={true} showMoreLimit={100} />
              </FacetDropdown>
              <FacetDropdown buttonText="Finish Color" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="variants.options.Finish Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </FacetDropdown>
              <FacetDropdown buttonText="Number of Lights" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.number_of_bulbs"
                  title="Number of Lights"
                  sortBy={sortByNumericName}
                  limit={20}
                  showMore={true}
                  showMoreLimit={40}
                  classNames={{
                    root: 'numbers-of-lights',
                    list: 'grid grid-cols-4 gap-4 max-w-64',
                    item: 'flex m-0 p-0',
                    label: 'flex relative m-0 p-0',
                    checkbox: 'peer left-0 top-0 !m-0 !w-full !h-full absolute appearance-none !rounded-none !bg-transparent !bg-none !shadow-none !border-brand-300',
                    labelText: 'w-full py-1 px-2 inline-flex items-center justify-center text-sm font-medium cursor-pointer text-gray-900 focus:outline-none bg-white border border-brand-300 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 bg-blue-50 text-brand-700 peer-hover:bg-gray-100 peer-hover:text-primary-700 peer-checked:bg-gray-100 peer-checked:text-primary-700',
                    count: '!hidden'
                  }} />
              </FacetDropdown>
              <FacetDropdown buttonText="Style" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.product_style" />
              </FacetDropdown>

              {/* Patio (Heating specific): Fuel Source, Collection, Mounting Option, Voltage Rating */}
              {/*
              <FacetDropdown buttonText="Fuel Source" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.fuel_source" />
              </FacetDropdown>
              <FacetDropdown buttonText="Collection" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.collection" />
              </FacetDropdown>
              <FacetDropdown buttonText="Mounting Options" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.mounting_options" />
              </FacetDropdown>
              <FacetDropdown buttonText="Voltage Rating" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.voltage" />
              </FacetDropdown>
              */}

              {/* Patio (Shading specific): Collection, Shape, Price, Weight, Finish */}
              {/*
              <FacetDropdown buttonText="Collection" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.collection" />
              </FacetDropdown>
              <FacetDropdown buttonText="Shape" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.product_shape" />
              </FacetDropdown>
              <FacetDropdown buttonText="Price" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RangeInput attribute="prices.USD" classNames={{ input: 'max-w-[80px]' }} />
              </FacetDropdown>
              <FacetDropdown buttonText="Weight" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="metafields.Akeneo.weight" />
              </FacetDropdown>
              <FacetDropdown buttonText="Finish" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none !border-gray-300' }}>
                <RefinementList attribute="variants.options.Finish Color" searchable={true} searchablePlaceholder="Quick Lookup" />
              </FacetDropdown>
              */}
            {/* </DynamicWidgets> */}
          </div>
        </div>

        <div className="mt-8 lg:mt-4 mb-4 flex flex-col items-center lg:flex-row lg:flex-wrap">
          <CurrentRefinements classNames={{ 
            root: 'mt-4 inline-flex justify-center order-2 lg:order-4 lg:flex-grow lg:justify-start', 
            list: '!inline-flex space-x-2 justify-center !flex-wrap lg:justify-start', 
            item: '!px-0 !inline-flex !flex-wrap !space-x-2 justify-center !bg-none !bg-transparent !border-none', 
            label: '!my-1',
            category: '!inline-block !mx-0 !my-1 !px-2 !py-1 !rounded-full !bg-gray-100 !border-gray-100 whitespace-nowrap max-w-full' 
          }} />
          <ClearRefinements title="Applied Filters" buttonText="Clear All Filters" classNames={{ root: 'mt-2 flex items-center space-x-4 justify-center order-3 lg:mt-0 lg:order-2 lg:justify-start lg:ml-4', title: 'whitespace-nowrap text-center order-1 lg:flex-none lg:order-1', button: '!inline !px-0 !w-auto !text-base !bg-none !border-none !shadow-none !text-brand-300 !underline !hover:text-brand-600' }} />
          <div className="lg:order-3 lg:basis-full lg:h-0"></div>
        </div>

        {useAsyncMode
          ? <HitsAsync view={view} useDefaultPrices={useDefaultPrices} promotions={promotions} />
          : <Hits view={view} useDefaultPrices={useDefaultPrices} promotions={promotions} />
        }

        <div className="mt-4 flex flex-col lg:flex-row lg:space-x-4 items-center">
          <Pagination classNames={{ 
            root: 'mt-4 lg:mt-0 mx-auto lg:mx-0 flex-auto order-2 lg:order-1 justify-center !shadow-none', 
            link: '!px-2 md:!px-3 lg:!px-4 !shadow-none !border-gray-300'
          }} />
          <div className="lg:ml-auto flex-none flex flex-col md:flex-row space-x-4 items-center order-1 lg:order-2 justify-center">
            <Stats classNames={{ root: 'mt-2 md:mt-0 flex-none order-2 md:order-1' }} />
            <HitsPerPage items={[
              { label: '10 per page', value: 10 },
              { label: '20 per page', value: 20, default: true },
              { label: '50 per page', value: 50 }
            ]} classNames={{ root: 'flex-none ml-auto lg:ml-0 order-1 md:order-2', select: '!shadow-none !border-gray-300' }} />
          </div>
        </div>

      </div>

    </InstantSearchNext>
  );
}