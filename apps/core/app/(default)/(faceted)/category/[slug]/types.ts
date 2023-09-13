import { z } from 'zod';

import { fetchCategory, PublicSearchParamsSchema } from './fetchCategory';

const publicParamKeys = PublicSearchParamsSchema.keyof();

export type PublicParamKeys = z.infer<typeof publicParamKeys>;

export type Facet = Awaited<ReturnType<typeof fetchCategory>>['facets']['items'][number];
