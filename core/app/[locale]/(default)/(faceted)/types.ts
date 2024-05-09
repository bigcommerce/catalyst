import { z } from 'zod';

import { fetchFacetedSearch, PublicSearchParamsSchema } from './fetch-faceted-search';

const publicParamKeys = PublicSearchParamsSchema.keyof();

export type PublicParamKeys = z.infer<typeof publicParamKeys>;

export type Facet = Awaited<ReturnType<typeof fetchFacetedSearch>>['facets']['items'][number];

export type PageType = 'brand' | 'category' | 'search';
