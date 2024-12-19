import { createSearchParamsCache } from 'nuqs/server';
import { cache } from 'react';
import { z } from 'zod';

import { getFilterParsers } from '@/vibes/soul/sections/products-list-section/filter-parsers';
import { facetsTransformer } from '~/data-transformers/facets-transformer';

import { fetchFacetedSearch, PublicSearchParamsSchema } from './fetch-faceted-search';

export const createFiltersSearchParamCache = cache(
  async (params: z.input<typeof PublicSearchParamsSchema>) => {
    const search = await fetchFacetedSearch(params);
    const facets = search.facets.items.filter(
      (facet) => facet.__typename !== 'CategorySearchFilter',
    );
    const transformedFacets = await facetsTransformer({
      refinedFacets: facets,
      allFacets: facets,
      searchParams: {},
    });
    const filters = transformedFacets.filter((facet) => facet != null);

    return createSearchParamsCache(getFilterParsers(filters));
  },
);
