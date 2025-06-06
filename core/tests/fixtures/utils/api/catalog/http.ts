import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import { Brand, CatalogApi, Category, Product } from '.';

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

const CategorySchema = z
  .object({
    category_id: z.number(),
    parent_id: z.number(),
    name: z.string(),
    description: z.string(),
    url: z.object({
      path: z.string(),
    }),
  })
  .transform(
    (data): Category => ({
      categoryId: data.category_id,
      parentId: data.parent_id,
      name: data.name,
      description: data.description,
      path: data.url.path,
    }),
  );

const BrandSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    custom_url: z.object({
      url: z.string(),
    }),
  })
  .transform(
    (data): Brand => ({
      id: data.id,
      name: data.name,
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
  getCategories: async (filters = {}): Promise<Category[]> => {
    const trees = await httpClient
      .get(`/v3/catalog/trees?channel_id:in=${testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1}`)
      .parse(apiResponseSchema(z.array(z.object({ id: z.number() }))));

    const params = new URLSearchParams({
      is_visible: 'true',
      'tree_id:in': trees.data.map((tree) => tree.id).join(','),
      ...(filters.ids ? { 'id:in': filters.ids.join(',') } : {}),
      ...(filters.nameLike ? { 'name:like': filters.nameLike } : {}),
    });

    const resp = await httpClient
      .get(`/v3/catalog/trees/categories?${params}`)
      .parse(apiResponseSchema(z.array(CategorySchema)));

    return resp.data;
  },
  getBrands: async (filters = {}): Promise<Brand[]> => {
    const params = new URLSearchParams({
      ...(filters.ids ? { 'id:in': filters.ids.join(',') } : {}),
      ...(filters.nameLike ? { 'name:like': filters.nameLike } : {}),
    });

    const resp = await httpClient
      .get(`/v3/catalog/brands${params.size ? `?${params}` : ''}`)
      .parse(apiResponseSchema(z.array(BrandSchema)));

    return resp.data;
  },
};
