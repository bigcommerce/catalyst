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
  //HitsPerPage,
  //Pagination,
  //SortBy,
  //Stats
  useRefinementList
} from 'react-instantsearch';
import { InstantSearchNext } from 'react-instantsearch-nextjs';
import type { RefinementListProps } from 'react-instantsearch';

import { Panel } from '~/belami/components/panel';
import { ClearRefinements, CurrentRefinements, SortBy, HitsPerPage, Pagination, Hits, HitsAsync, Facet, FacetDropdown, Stats, RatingMenu } from '~/belami/components/search';

import { createFallbackableCache } from "@algolia/cache-common";
import { createInMemoryCache } from "@algolia/cache-in-memory";
import { createBrowserLocalStorageCache } from "@algolia/cache-browser-local-storage";

import { cn } from '~/lib/utils';

import { Minus } from 'lucide-react';
import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
//import { Link } from '~/components/link';
import Link from 'next/link';
import Image from 'next/image';
//import { BcImage } from '~/components/bc-image';
import noImage from '~/public/no-image.svg';

const searchClient = algoliasearch(
  process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
  {
    /*
    // Caches responses from Algolia
    responsesCache: createFallbackableCache({
      caches: [
        createBrowserLocalStorageCache({ key: `${process.env.NEXT_PUBLIC_ALGOLIA_VERSION}-${process.env.NEXT_PUBLIC_ALGOLIA_APP_ID}` }),
        createInMemoryCache()
      ]
    })
    */
  }
);
const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

//const useDefaultPrices = process.env.NEXT_PUBLIC_USE_DEFAULT_PRICES === 'true';
const useAsyncMode = process.env.NEXT_PUBLIC_USE_ASYNC_MODE === 'true';
//const useAsyncMode = false;

const sortByNumericName: RefinementListProps['sortBy'] = (a: any, b: any) => {
  return parseInt(a.name) < parseInt(b.name) ? -1 : 1;
};

const sortByNumericRangeName: RefinementListProps['sortBy'] = (a: any, b: any) => {
  const a1 = a.name.split(' ')[0];
  const b1 = b.name.split(' ')[0];
  return parseInt(a1.replace(/\D/g,'')) < parseInt(b1.replace(/\D/g,'')) ? -1 : 1;
};

//const closeOnChange = () => window.innerWidth > 375;
const closeOnChange = false;

export const Brand = ({ brand, promotions, useDefaultPrices = false, priceMaxRules = null, userContext = null }: any) => {

  const [view, setView] = useState('grid');

  const [showSidebar, _setShowSidebar] = useState(false);
  const [showViewResultsButton, setShowViewResultsButton] = useState(false);

  const [showCompareSidebar, setShowCompareSidebar] = useState(false);
  const { products, setProducts } = useCompareDrawerContext();

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

  function VirtualRefinementList(props: any) {
    useRefinementList(props);
    return null;
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
            return {
              query: indexUiState.query,
              categories: indexUiState.hierarchicalMenu?.['categories.lvl0'],
              brand_name: indexUiState.refinementList?.['brand_name'],
              prices: indexUiState.refinementList?.['prices.USD'],
              price_range: indexUiState.refinementList?.['price_range'],
              reviews_rating_sum: indexUiState.refinementList?.['reviews_rating_sum'],
              inventory_range: indexUiState.refinementList?.['inventory_range'],
              finish_color: indexUiState.refinementList?.['variants.options.Finish Color'],
              glass_color: indexUiState.refinementList?.['variants.options.Glass Color'],
              shade_color: indexUiState.refinementList?.['variants.options.Shade Color'],
              blade_color: indexUiState.refinementList?.['variants.options.Blade Color'],
              length: indexUiState.refinementList?.['metafields.Details.Length'],
              weight: indexUiState.refinementList?.['metafields.Details.Weight'],
              depth: indexUiState.refinementList?.['metafields.Details.Depth'],
              width: indexUiState.refinementList?.['metafields.Details.Width'],
              height: indexUiState.refinementList?.['metafields.Details.Height'],
              application: indexUiState.refinementList?.['metafields.Details.Application'],
              base_type: indexUiState.refinementList?.['metafields.Details.Base Type'],
              blade_span: indexUiState.refinementList?.['metafields.Details.Blade Span'],
              blade_to_ceiling_height: indexUiState.refinementList?.['metafields.Details.Blade to Ceiling Height'],
              collection: indexUiState.refinementList?.['metafields.Details.Collection'],
              color_temperature: indexUiState.refinementList?.['metafields.Details.Color Temperature'],
              control_type: indexUiState.refinementList?.['metafields.Details.Control Type'],
              crystal_type: indexUiState.refinementList?.['metafields.Details.Crystal Type'],
              designer: indexUiState.refinementList?.['metafields.Details.Designer'],
              fuel_source: indexUiState.refinementList?.['metafields.Details.Fuel Source'],
              hanging_method: indexUiState.refinementList?.['metafields.Details.Hanging Method'],
              heat_rating: indexUiState.refinementList?.['metafields.Details.Heat Rating'],
              heating_area: indexUiState.refinementList?.['metafields.Details.Heating Area'],
              ir_heat_technology: indexUiState.refinementList?.['metafields.Details.IR Heat Technology'],
              lift: indexUiState.refinementList?.['metafields.Details.Lift'],
              light_kit_type: indexUiState.refinementList?.['metafields.Details.Light Kit Type'],
              lumen_output: indexUiState.refinementList?.['metafields.Details.Lumen Output'],
              material: indexUiState.refinementList?.['metafields.Details.Material'],
              minimum_mounting_height: indexUiState.refinementList?.['metafields.Details.Minimum Mounting Height'],
              number_of_blades: indexUiState.refinementList?.['metafields.Details.Number of Blades'],
              number_of_bulbs: indexUiState.refinementList?.['metafields.Details.Number of Bulbs'],
              number_of_main_burners: indexUiState.refinementList?.['metafields.Details.Number of Main Burners'],
              pole_material: indexUiState.refinementList?.['metafields.Details.Pole Material'],
              pole_diameter: indexUiState.refinementList?.['metafields.Details.Pole Diameter'],
              power_source: indexUiState.refinementList?.['metafields.Details.Power Source'],
              product_design: indexUiState.refinementList?.['metafields.Details.Product Design'],
              product_shape: indexUiState.refinementList?.['metafields.Details.Product Shape'],
              product_style: indexUiState.refinementList?.['metafields.Details.Product Style'],
              shade_height: indexUiState.refinementList?.['metafields.Details.Shade Height'],
              shade_material: indexUiState.refinementList?.['metafields.Details.Shade Material'],
              shade_wiidth_bottom: indexUiState.refinementList?.['metafields.Details.Shade Width Bottom'],
              shade_wiidth_top: indexUiState.refinementList?.['metafields.Details.Shade Width Top'],
              smart_compatible: indexUiState.refinementList?.['metafields.Details.Smart Compatible'],
              smart_product: indexUiState.refinementList?.['metafields.Details.Smart Product'],
              switch_type: indexUiState.refinementList?.['metafields.Details.Switch Type'],
              tilt: indexUiState.refinementList?.['metafields.Details.Tilt'],
              total_grilling_area: indexUiState.refinementList?.['metafields.Details.Total Grilling Area'],
              voltage: indexUiState.refinementList?.['metafields.Details.Voltage'],
              voltage_options: indexUiState.refinementList?.['metafields.Details.Voltage Options'],
              wattage: indexUiState.refinementList?.['metafields.Details.Wattage'],
              on_sale: indexUiState.toggle?.['on_sale'] === null || indexUiState.toggle?.['on_sale'] === undefined ? undefined : indexUiState.toggle?.['on_sale'] as any,
              on_clearance: indexUiState.toggle?.['on_clearance'] === null || indexUiState.toggle?.['on_clearance'] === undefined ? undefined : indexUiState.toggle?.['on_clearance'] as any,
              is_new: indexUiState.toggle?.['is_new'] === null || indexUiState.toggle?.['is_new'] === undefined ? undefined : indexUiState.toggle?.['is_new'] as any,
              in_stock: indexUiState.toggle?.['in_stock'] === null || indexUiState.toggle?.['in_stock'] === undefined ? undefined : indexUiState.toggle?.['in_stock'] as any,
              free_shipping: indexUiState.toggle?.['free_shipping'] === null || indexUiState.toggle?.['free_shipping'] === undefined ? undefined : indexUiState.toggle?.['free_shipping'] as any,
              controls_included: indexUiState.toggle?.['metafields.Details.Controls Included'] === null || indexUiState.toggle?.['metafields.Details.Controls Included'] === undefined ? undefined : indexUiState.toggle?.['metafields.Details.Controls Included'] as any,
              photocell_included: indexUiState.toggle?.['metafields.Details.Photocell Included'] === null || indexUiState.toggle?.['metafields.Details.Photocell Included'] === undefined ? undefined : indexUiState.toggle?.['metafields.Details.Photocell Included'] as any,
              can_be_recessed: indexUiState.toggle?.['metafields.Details.Can be Recessed'] === null || indexUiState.toggle?.['metafields.Details.Can be Recessed'] === undefined ? undefined : indexUiState.toggle?.['metafields.Details.Can be Recessed'] as any,
              page: indexUiState.page,
              hitsPerPage: indexUiState.hitsPerPage,
              sortBy: indexUiState.sortBy,
            };
          },
          routeToState(routeState: any) {
            return {
              [indexName]: {
                query: routeState?.query,
                hierarchicalMenu: {
                  'categories.lvl0': routeState?.categories
                },
                refinementList: {
                  'brand_name': routeState?.brand_name,
                  'prices.USD': routeState?.prices,
                  'price_range': routeState?.price_range,
                  'reviews_rating_sum': routeState?.reviews_rating_sum,
                  'variants.options.Finish Color': routeState?.finish_color,
                  'variants.options.Glass Color': routeState?.glass_color,
                  'variants.options.Shade Color': routeState?.shade_color,
                  'variants.options.Blade Color': routeState?.blade_color,
                  'metafields.Details.Length': routeState?.length,
                  'metafields.Details.Weight': routeState?.weight,
                  'metafields.Details.Depth': routeState?.depth,
                  'metafields.Details.Width': routeState?.width,
                  'metafields.Details.Height': routeState?.height,
                  'metafields.Details.Application': routeState?.application,
                  'metafields.Details.Base Type': routeState?.base_type,
                  'metafields.Details.Blade Span': routeState?.blade_span,
                  'metafields.Details.Blade to Ceiling Height': routeState?.blade_to_ceiling_height,
                  'metafields.Details.Collection': routeState?.collection,
                  'metafields.Details.Color Temperature': routeState?.color_temperature,
                  'metafields.Details.Control Type': routeState?.control_type,
                  'metafields.Details.Crystal Type': routeState?.crystal_type,
                  'metafields.Details.Designer': routeState?.designer,
                  'metafields.Details.Fuel Source': routeState?.fuel_source,
                  'metafields.Details.Hanging Method': routeState?.hanging_method,
                  'metafields.Details.Heat Rating': routeState?.heat_rating,
                  'metafields.Details.Heating Area': routeState?.heating_area,
                  'metafields.Details.IR Heat Technology': routeState?.ir_heat_technology,
                  'metafields.Details.Lift': routeState?.lift,
                  'metafields.Details.Light Kit Type': routeState?.light_kit_type,
                  'metafields.Details.Lumen Output': routeState?.lumen_output,
                  'metafields.Details.Material': routeState?.material,
                  'metafields.Details.Minimum Mounting Height': routeState?.minimum_mounting_height,
                  'metafields.Details.Number of Blades': routeState?.number_of_blades,
                  'metafields.Details.Number of Bulbs': routeState?.number_of_bulbs,
                  'metafields.Details.Number of Main Burners': routeState?.number_of_main_burners,
                  'metafields.Details.Pole Material': routeState?.pole_material,
                  'metafields.Details.Pole Diameter': routeState?.pole_diameter,
                  'metafields.Details.Power Source': routeState?.power_source,
                  'metafields.Details.Product Design': routeState?.product_design,
                  'metafields.Details.Product Shape': routeState?.product_shape,
                  'metafields.Details.Product Style': routeState?.product_style,
                  'metafields.Details.Shade Height': routeState?.shade_height,
                  'metafields.Details.Shade Material': routeState?.shade_material,
                  'metafields.Details.Shade Width Bottom': routeState?.shade_width_bottom,
                  'metafields.Details.Shade Width Top': routeState?.shade_width_top,
                  'metafields.Details.Smart Compatible': routeState?.smart_compatible,
                  'metafields.Details.Smart Product': routeState?.smart_product,
                  'metafields.Details.Switch Type': routeState?.switch_type,
                  'metafields.Details.Tilt': routeState?.tilt,
                  'metafields.Details.Total Grilling Area': routeState?.total_grilling_area,
                  'metafields.Details.Voltage': routeState?.voltage,
                  'metafields.Details.Voltage Options': routeState?.voltage_options,
                  'metafields.Details.Wattage': routeState?.wattage,
                },
                toggle: {
                  'free_shipping': routeState?.free_shipping == null || routeState?.free_shipping == undefined ? undefined : (routeState?.free_shipping === 'true' || routeState?.free_shipping === true),
                  'is_new': routeState?.is_new == null || routeState?.is_new == undefined ? undefined : (routeState?.is_new === 'true' || routeState?.is_new === true),
                  'on_sale': routeState?.on_sale == null || routeState?.on_sale == undefined ? undefined : (routeState?.on_sale === 'true' || routeState?.on_sale === true),
                  'on_clearance': routeState?.on_clearance == null || routeState?.on_clearance == undefined ? undefined : (routeState?.on_clearance === 'true' || routeState?.on_clearance === true),
                  'in_stock': routeState?.in_stock == null || routeState?.in_stock == undefined ? undefined : (routeState?.in_stock === 'true' || routeState?.in_stock === true),
                  'metafields.Details.Controls Included': routeState?.controls_included == null || routeState?.controls_included == undefined ? undefined : (routeState?.controls_included === 'true' || routeState?.controls_included === true),
                  'metafields.Details.Photocell Included': routeState?.photocell_included == null || routeState?.photocell_included == undefined ? undefined : (routeState?.photocell_included === 'true' || routeState?.photocell_included === true),
                  'metafields.Details.Can be Recessed': routeState?.can_be_recessed == null || routeState?.can_be_recessed == undefined ? undefined : (routeState?.can_be_recessed === 'true' || routeState?.can_be_recessed === true),
                },
                page: routeState?.page,
                hitsPerPage: routeState?.hitsPerPage,
                sortBy: routeState?.sortBy,
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
      <Configure ruleContexts={ruleContexts} analyticsTags={analyticsTags} filters={`brand_name:"${brand.name}"`} maxFacetHits={100} />
      {showSidebar &&
        <div className="hidden sm:block fixed inset-0 w-full h-full pointer-events-auto z-[9995] bg-black bg-opacity-60 backdrop-blur-sm opacity-100" onClick={() => setShowSidebar(false)}></div>
      }
      <aside className={cn(
        'fixed p-8 z-[9999] pointer-events-auto bg-white box-border w-full top-0 left-0 facets sm:max-w-[450px] max-h-full h-screen duration-300 ease-in-out overflow-y-auto',
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
              <VirtualRefinementList attribute="inventory_range" />
              <Facet title="Collection">
                <RefinementList attribute="metafields.Details.Collection" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Facet title="Finish Color">
                <RefinementList attribute="variants.options.Finish Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Facet title="Glass Color">
                <RefinementList attribute="variants.options.Glass Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Facet title="Shade Color">
                <RefinementList attribute="variants.options.Shade Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Facet title="Blade Color">
                <RefinementList attribute="variants.options.Blade Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
              </Facet>
              <Facet title="Number of Lights">
                <RefinementList attribute="metafields.Details.Number of Bulbs"
                  sortBy={sortByNumericName}
                  limit={20}
                  showMore={true}
                  showMoreLimit={40}
                  classNames={{
                    root: 'number-of-lights',
                    list: 'grid grid-cols-4 gap-4 max-w-64',
                    item: 'flex m-0 p-0',
                    label: 'flex relative m-0 p-0',
                    checkbox: 'peer left-0 top-0 !m-0 !w-full !h-full absolute appearance-none !rounded-none !bg-transparent !bg-none !shadow-none !border-brand-300',
                    labelText: 'w-full py-1 px-2 inline-flex items-center justify-center text-sm font-medium cursor-pointer text-gray-900 focus:outline-none bg-white border border-brand-300 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-100 bg-blue-50 text-brand-700 peer-hover:bg-gray-100 peer-hover:text-primary-700 peer-checked:bg-gray-100 peer-checked:text-primary-700',
                    count: '!hidden'
                  }} />
              </Facet>
              <Facet title="Style">
                <RefinementList attribute="metafields.Details.Product Style" />
              </Facet>
              <Facet title="Fuel Source">
                <RefinementList attribute="metafields.Details.Fuel Source" />
              </Facet>
              <Facet title="Voltage Rating">
                <RefinementList attribute="metafields.Details.Voltage" />
              </Facet>
              <Facet title="Shape">
                <RefinementList attribute="metafields.Details.Product Shape" />
              </Facet>
              {/*
              <Panel header="Price">
                <RangeInput attribute="prices.USD" classNames={{ input: 'max-w-[80px]' }} />
              </Panel>
              */}
              <Facet title="Price">
                <RefinementList attribute="price_range" sortBy={sortByNumericRangeName} searchable={false} />
              </Facet>
              <Facet title="Length">
                <RefinementList attribute="metafields.Details.Length" searchable={false} />
              </Facet>
              <Facet title="Weight">
                <RefinementList attribute="metafields.Details.Weight" searchable={false} />
              </Facet>
              <Facet title="Depth">
                <RefinementList attribute="metafields.Details.Depth" searchable={false} />
              </Facet>
              <Facet title="Width">
                <RefinementList attribute="metafields.Details.Width" searchable={false} />
              </Facet>
              <Facet title="Height">
                <RefinementList attribute="metafields.Details.Height" searchable={false} />
              </Facet>
              <Facet title="Application">
                <RefinementList attribute="metafields.Details.Application" />
              </Facet>
              <Facet title="Base Type">
                <RefinementList attribute="metafields.Details.Base Type" />
              </Facet>
              <Facet title="Blade Span">
                <RefinementList attribute="metafields.Details.Blade Span" />
              </Facet>
              <Facet title="Blade to Ceiling Height">
                <RefinementList attribute="metafields.Details.Blade to Ceiling Height" />
              </Facet>
              <Facet title="Color Temperature">
                <RefinementList attribute="metafields.Details.Color Temperature" />
              </Facet>
              <Facet title="Control Type">
                <RefinementList attribute="metafields.Details.Control Type" />
              </Facet>
              <Facet title="Crystal Type">
                <RefinementList attribute="metafields.Details.Crystal Type" />
              </Facet>
              <Facet title="Designer">
                <RefinementList attribute="metafields.Details.Designer" />
              </Facet>
              <Facet title="Controls Included">
                <RefinementList attribute="metafields.Details.Controls Included" />
              </Facet>
              <Facet title="Hanging Method">
                <RefinementList attribute="metafields.Details.Hanging Method" />
              </Facet>
              <Facet title="Heat Rating">
                <RefinementList attribute="metafields.Details.Heat Rating" />
              </Facet>
              <Facet title="Heating Area">
                <RefinementList attribute="metafields.Details.Heating Area" />
              </Facet>
              <Facet title="IR Heat Technology">
                <RefinementList attribute="metafields.Details.IR Heat Technology" />
              </Facet>
              <Facet title="Lift">
                <RefinementList attribute="metafields.Details.Lift" />
              </Facet>
              <Facet title="Light Kit Type">
                <RefinementList attribute="metafields.Details.Light Kit Type" />
              </Facet>
              <Facet title="Lumen Output">
                <RefinementList attribute="metafields.Details.Lumen Output" />
              </Facet>
              <Facet title="Material">
                <RefinementList attribute="metafields.Details.Material" />
              </Facet>
              <Facet title="Minimum Mounting Height">
                <RefinementList attribute="metafields.Details.Minimum Mounting Height" />
              </Facet>
              <Facet title="Number of Blades">
                <RefinementList attribute="metafields.Details.Number of Blades" />
              </Facet>
              <Facet title="Number of Main Burners">
                <RefinementList attribute="metafields.Details.Number of Main Burners" />
              </Facet>
              <Facet title="Photocell Included">
                <RefinementList attribute="metafields.Details.Photocell Included" />
              </Facet>
              <Facet title="Pole Material">
                <RefinementList attribute="metafields.Details.Pole Material" />
              </Facet>
              <Facet title="Pole Diameter">
                <RefinementList attribute="metafields.Details.Pole Diameter" />
              </Facet>
              <Facet title="Power Source">
                <RefinementList attribute="metafields.Details.Power Source" />
              </Facet>
              <Facet title="Product Design">
                <RefinementList attribute="metafields.Details.Product Design" />
              </Facet>
              <Facet title="Shade Height">
                <RefinementList attribute="metafields.Details.Shade Height" />
              </Facet>
              <Facet title="Shade Material">
                <RefinementList attribute="metafields.Details.Shade Material" />
              </Facet>
              <Facet title="Shade Width Bottom">
                <RefinementList attribute="metafields.Details.Shade Width Bottom" />
              </Facet>
              <Facet title="Shade Width Top">
                <RefinementList attribute="metafields.Details.Shade Width Top" />
              </Facet>
              <Facet title="Smart Compatible">
                <RefinementList attribute="metafields.Details.Smart Compatible" />
              </Facet>
              <Facet title="Smart Product">
                <RefinementList attribute="metafields.Details.Smart Product" />
              </Facet>
              <Facet title="Switch Type">
                <RefinementList attribute="metafields.Details.Switch Type" />
              </Facet>
              <Facet title="Tilt">
                <RefinementList attribute="metafields.Details.Tilt" />
              </Facet>
              <Facet title="Total Grilling Area">
                <RefinementList attribute="metafields.Details.Total Grilling Area" />
              </Facet>
              <Facet title="Voltage Options">
                <RefinementList attribute="metafields.Details.Voltage Options" />
              </Facet>
              <Facet title="Wattage">
                <RefinementList attribute="metafields.Details.Wattage" />
              </Facet>
              {/*
              <Panel header="Can be Recessed">
                <ToggleRefinement attribute="metafields.Details.Can be Recessed" label="Can be Recessed" />
              </Panel>
              */}
              <ToggleRefinement attribute="metafields.Details.Can be Recessed" label="Can be Recessed" />
              {/*
              <Panel header="Rating">
                <RatingMenu attribute="reviews_rating_sum" />
              </Panel>
              */}
              {/*
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
              */}
              <ToggleRefinement attribute="free_shipping" label="Free Shipping" />
              <ToggleRefinement attribute="is_new" label="Is New" />
              <ToggleRefinement attribute="on_sale" label="On Sale" />
              <ToggleRefinement attribute="on_clearance" label="On Clearance" />
              <ToggleRefinement attribute="in_stock" label="In Stock" />
            </DynamicWidgets>
          </div>
          <SortBy label="Sort By" items={[
            { label: 'Relevance', value: indexName },
            { label: 'Price (Low to High)', value: `${indexName}_sort_prices_USD_asc` },
            { label: 'Price (High to Low)', value: `${indexName}_sort_prices_USD_desc` },
            { label: 'Avg. Customer Review', value: `${indexName}_reviews_rating_sum_desc` },
            { label: 'Number of Reviews', value: `${indexName}_reviews_count_desc` },
            { label: 'Best Sellers', value: `${indexName}_total_sold_desc` }
          ]} classNames={{ root: 'order-1', button: 'w-full !shadow-none !border-gray-300 rounded border', buttonLabel: '!mr-2', buttonText: 'text-brand-300', item: 'text-sm py-1', active: 'text-brand-300' }} />
        </div>
      </aside>

      {showCompareSidebar &&
        <div className="hidden sm:block fixed inset-0 w-full h-full pointer-events-auto z-[9995] bg-black bg-opacity-60 backdrop-blur-sm opacity-100" onClick={() => setShowCompareSidebar(false)}></div>
      }
      <aside className={cn(
        'fixed p-8 z-[9999] pointer-events-auto bg-white box-border w-full top-0 left-0 facets sm:max-w-[450px] max-h-full h-screen duration-300 ease-in-out overflow-y-auto',
        showCompareSidebar ? 'shadow-2xl shadow-blue-gray-900/10 translate-x-0' : '-translate-x-full'
      )}>
        <button title="Close" type="button" onClick={() => setShowCompareSidebar(false)} className="ml-auto flex text-xl justify-center"><Minus /></button>
        {/* <h3 className="text-center text-2xl">Compare Products</h3> */}
        <ul className="mt-5">
          {products.map((product) => {
            return (
              <li
                className="mb-4 p-4 flex items-center space-x-4 border border-gray-200"
                key={product.id}
              >
                <div className="w-48">
                  <div className="pb-full relative mx-auto my-0 flex h-auto w-full overflow-hidden pb-[100%]">
                    <figure className="absolute left-0 top-0 h-full w-full">
                      <div className="flex h-full w-full items-center justify-center align-middle">
                        {product.image && product.image.src ? (
                          <img
                            src={product.image.src}
                            alt={product.image.altText}
                            className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                          />
                        ) : (
                          <Image
                            src={noImage}
                            alt="No Image"
                            className="relative m-auto inline-block h-auto max-h-full w-auto max-w-full align-middle"
                          />
                        )}
                      </div>
                    </figure>
                  </div>
                </div>
                <div>{product.name}</div>
                <button title="Remove" onClick={() => setProducts(products.filter(({ id }) => id !== product.id))}>
                  <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 18C2.45 18 1.97917 17.8042 1.5875 17.4125C1.19583 17.0208 1 16.55 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8042 17.0208 14.4125 17.4125C14.0208 17.8042 13.55 18 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z" fill="currentColor" /></svg>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-5 flex items-center space-x-4">
          <button 
            onClick={() => { setProducts([]); setShowCompareSidebar(false) } }
            className="flex items-center justify-center w-full text-center px-4 h-10 bg-white hover:bg-gray-30 uppercase rounded border border-brand-400 shadow-none"
          >Clear All</button>
          {products?.length > 1 &&
          <Link 
            href={{ pathname: '/compare', query: { ids: products.map(({ id }) => id).join(',') } }} 
            onClick={() => setShowCompareSidebar(false)}
            className="flex items-center justify-center space-x-2 px-4 h-10 bg-brand-600 uppercase whitespace-nowrap text-white rounded border border-brand-600 cursor-pointer hover:bg-brand-400 hover:border-brand-400"
          >Compare Items ({products.length})</Link>
          }
        </div>
      </aside>

      <div id="catalog" className={showSidebar ? 'overflow-hidden h-0 sm:overflow-auto sm:h-auto' : ''}>

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
            {products?.length > 0 &&
              <button type="button" className="flex-none md:ml-auto flex items-center space-x-2 px-4 h-10 rounded text-white bg-brand-500 border border-brand-500 cursor-pointer" onClick={() => setShowCompareSidebar(true)}>
                <span>Compare ({products.length})</span>
                <svg width="18" height="22" viewBox="0 0 18 22" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7 22V20H2C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4C0 3.45 0.195833 2.97917 0.5875 2.5875C0.979167 2.19583 1.45 2 2 2H7V0H9V22H7ZM2 17H7V11L2 17ZM11 20V11L16 17V4H11V2H16C16.55 2 17.0208 2.19583 17.4125 2.5875C17.8042 2.97917 18 3.45 18 4V18C18 18.55 17.8042 19.0208 17.4125 19.4125C17.0208 19.8042 16.55 20 16 20H11Z" fill="currentColor" /></svg>
              </button>
            }
            <button type="button" className="flex-none md:ml-auto flex items-center space-x-2 px-4 h-10 rounded border border-gray-300 cursor-pointer" onClick={() => toggleView()}>
              <span>View:</span>
              {view === 'list' &&
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2V6H12V2H8ZM14 2V6H18V2H14ZM14 8V12H18V8H14ZM14 14V18H18V14H14ZM12 18V14H8V18H12ZM6 18V14H2V18H6ZM6 12V8H2V12H6ZM6 6V2H2V6H6ZM8 12H12V8H8V12ZM2 0H18C18.5304 0 19.0391 0.210714 19.4142 0.585786C19.7893 0.960859 20 1.46957 20 2V18C20 18.5304 19.7893 19.0391 19.4142 19.4142C19.0391 19.7893 18.5304 20 18 20H2C0.92 20 0 19.1 0 18V2C0 1.46957 0.210714 0.960859 0.585786 0.585786C0.960859 0.210714 1.46957 0 2 0Z" fill="black" /></svg>
              }
              {view === 'grid' &&
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.05882 0V5.71429H24V0M7.05882 20H24V14.2857H7.05882M7.05882 12.8571H24V7.14286H7.05882M0 5.71429H5.64706V0H0M0 20H5.64706V14.2857H0M0 12.8571H5.64706V7.14286H0V12.8571Z" fill="black" /></svg>
              }
            </button>
            <SortBy label="Sort By" items={[
              { label: 'Relevance', value: indexName },
              { label: 'Price (Low to High)', value: `${indexName}_sort_prices_USD_asc` },
              { label: 'Price (High to Low)', value: `${indexName}_sort_prices_USD_desc` },
              { label: 'Avg. Customer Review', value: `${indexName}_reviews_rating_sum_desc` },
              { label: 'Number of Reviews', value: `${indexName}_reviews_count_desc` },
              { label: 'Best Sellers', value: `${indexName}_total_sold_desc` }
            ]} classNames={{ root: 'flex-none', button: '!shadow-none !border-gray-300 rounded border', buttonLabel: '!mr-2', buttonText: 'text-brand-300', item: 'text-sm py-1', active: 'text-brand-300' }} />
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
            <FacetDropdown buttonText="Finish Color" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none' }}>
              <RefinementList attribute="variants.options.Finish Color" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
            </FacetDropdown>
            <FacetDropdown buttonText="Price" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none' }}>
              <RefinementList attribute="price_range" sortBy={sortByNumericRangeName} searchable={false} />
            </FacetDropdown>
            <FacetDropdown buttonText="Style" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none' }}>
              <RefinementList attribute="metafields.Details.Product Style" searchable={false} />
            </FacetDropdown>
            <FacetDropdown buttonText="Collection" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none' }}>
              <RefinementList attribute="metafields.Details.Collection" searchable={true} searchablePlaceholder="Quick Lookup" limit={10} showMore={true} showMoreLimit={100} />
            </FacetDropdown>
            <FacetDropdown buttonText="Width" closeOnChange={closeOnChange} classNames={{ root: 'flex-1', button: 'w-full whitespace-nowrap !shadow-none' }}>
              <RefinementList attribute="metafields.Details.Width" searchable={false} />
            </FacetDropdown>
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
          <ClearRefinements title="Applied Filters" buttonText="Remove All Filters" classNames={{ root: 'mt-2 flex items-center space-x-4 justify-center order-3 lg:mt-0 lg:order-2 lg:justify-start lg:ml-4', title: 'whitespace-nowrap text-center order-1 lg:flex-none lg:order-1', button: '!inline !px-0 !w-auto !text-base !bg-none !border-none !shadow-none !text-brand-300 !underline !hover:text-brand-600' }} />
          <div className="lg:order-3 lg:basis-full lg:h-0"></div>
        </div>

        {useAsyncMode
          ? <HitsAsync view={view} useDefaultPrices={useDefaultPrices} promotions={promotions} priceMaxRules={priceMaxRules} />
          : <Hits view={view} useDefaultPrices={useDefaultPrices} promotions={promotions} priceMaxRules={priceMaxRules} />
        }

        <div className="mt-4 flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 items-center">
          <Pagination padding={2} classNames={{ 
            //root: 'mt-4 lg:mt-0 mx-auto lg:mx-0 flex-auto order-2 lg:order-1 justify-center !shadow-none', 
            root: 'mt-4 lg:mt-0 mx-auto lg:mx-0 flex-auto justify-center !shadow-none', 
            link: '!px-2 md:!px-3 lg:!px-4 !shadow-none !border-gray-300'
          }} />
          {/*
          <div className="lg:ml-auto flex-none flex flex-col md:flex-row space-x-4 items-center order-1 lg:order-2 justify-center">
          */}
          <div className="lg:ml-auto flex-none flex flex-col md:flex-row space-x-4 items-center justify-center">
            <Stats classNames={{ root: 'mt-4 md:mt-0 flex-none order-2 md:order-1' }} />
            <HitsPerPage label="Items Per Page" items={[
              { label: '10 per page', value: 10 },
              { label: '20 per page', value: 20, default: true },
              { label: '50 per page', value: 50 }
            ]} classNames={{ root: 'flex-none ml-auto lg:ml-0 order-1 md:order-2', button: 'w-full !shadow-none !border-gray-300 rounded border', buttonLabel: '!mr-2 md:hidden', item: 'text-sm py-1', active: 'text-brand-300' }} />
          </div>
        </div>

      </div>

    </InstantSearchNext>
  );
}