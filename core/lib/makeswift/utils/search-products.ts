import { z } from 'zod';

import { BcProductSchema } from './use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

const SearchResponseSchema = z.object({
  data: z.object({ products: z.array(BcProductSchema) }).nullable(),
});

export async function searchProducts(query: string): Promise<BcProductSchema[]> {
  const response = await fetch(`/api/products?search=${query}`)
    .then((r) => r.json())
    .then(SearchResponseSchema.parse);

  return response.data?.products ?? [];
}
