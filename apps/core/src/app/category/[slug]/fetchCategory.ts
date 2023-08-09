import { SearchProductsSortInput } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import z from 'zod';

import client from '~/client';

const searchProductsSortInput: SearchProductsSortInput[] = [
  'A_TO_Z',
  'BEST_REVIEWED',
  'BEST_SELLING',
  'FEATURED',
  'HIGHEST_PRICE',
  'LOWEST_PRICE',
  'NEWEST',
  'RELEVANCE',
  'Z_TO_A',
];

export const PrivateSearchParamsSchema = z
  .object({
    searchTerm: z.string().optional(),
    categoryEntityId: z.number().optional(),
    limit: z.number().optional(),
    before: z.string().optional(),
    after: z.string().optional(),
    sort: z
      .string()
      .toUpperCase()
      .refine<SearchProductsSortInput>((value): value is SearchProductsSortInput =>
        Boolean(searchProductsSortInput.find((input) => input === value)),
      )
      .optional(),
  })
  .passthrough();

export const PublicSearchParamsSchema = z.preprocess((searchParams) => {
  const validatedRecord = z.record(z.unknown()).parse(searchParams);

  const { categoryId, ...rest } = validatedRecord;

  return {
    categoryEntityId: categoryId,
    ...rest,
  };
}, PrivateSearchParamsSchema);

export const fetchCategory = cache(
  // We need to make sure the reference passed into this function is the same if we want it to be memoized.
  async ({
    categoryEntityId,
    limit = 4,
    after,
    before,
    sort,
  }: z.infer<typeof PrivateSearchParamsSchema>) => {
    return client.getProductSearchResults({
      categoryEntityId,
      limit,
      after,
      before,
      sort,
    });
  },
);
