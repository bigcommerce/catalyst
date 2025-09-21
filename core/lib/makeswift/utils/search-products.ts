'use server';

import { getLocale } from 'next-intl/server';
import { z } from 'zod';

import { getSearchResults } from '~/client/queries/get-search-results';

import { BcProductSchema } from './use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

const SearchResponseSchema = z.object({
  data: z.object({ products: z.array(BcProductSchema) }).nullable(),
});

export async function searchProducts(query: string): Promise<BcProductSchema[]> {
  const locale = await getLocale();

  const result = await getSearchResults(query, locale).then(SearchResponseSchema.parse);

  return result.data?.products ?? [];
}
