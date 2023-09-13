import { z } from 'zod';

import { fetchFacetedSearch, PublicSearchParamsSchema } from './fetchFacetedSearch';

const publicParamKeys = PublicSearchParamsSchema.keyof();

export type PublicParamKeys = z.infer<typeof publicParamKeys>;

export type Facet = Awaited<ReturnType<typeof fetchFacetedSearch>>['facets']['items'][number];
