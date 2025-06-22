import { z } from 'zod';

import { BcCategorySchema } from './use-bc-category-to-vibes-category/use-bc-category-to-vibes-category';

const SearchResponseSchema = z.object({
  data: z.object({ categories: z.array(BcCategorySchema) }).nullable(),
});

export async function searchCategories(query: string): Promise<BcCategorySchema[]> {
  const response = await fetch(`/api/categories?search=${query}`)
    .then((r) => r.json())
    .then(SearchResponseSchema.parse);

  return response.data?.categories ?? [];
}
