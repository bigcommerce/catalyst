import { z } from 'zod';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { CatalogApi, Product } from '.';

const ProductSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    sku: z.string(),
    price: z.number(),
    retail_price: z.number(),
    sale_price: z.number(),
    custom_url: z.object({
      url: z.string(),
    }),
  })
  .transform(
    (data): Product => ({
      id: data.id,
      name: data.name,
      sku: data.sku,
      price: data.price,
      retailPrice: data.retail_price,
      salePrice: data.sale_price,
      path: data.custom_url.url,
    }),
  );

export const catalogHttpClient: CatalogApi = {
  getProductById: async (id: number): Promise<Product> => {
    const resp = await httpClient
      .get(`/v3/catalog/products/${id}`)
      .parse(apiResponseSchema(ProductSchema));

    return resp.data;
  },
};
