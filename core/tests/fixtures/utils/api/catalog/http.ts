import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { httpClient } from '../client';
import { apiResponseSchema } from '../schema';

import {
  Brand,
  CatalogApi,
  Category,
  CreateProductData,
  CreateVariantData,
  Product,
  Variant,
} from '.';

const VariantSchema = z
  .object({
    id: z.number(),
    product_id: z.number(),
    sku: z.string(),
    price: z.number().nullable(),
    sale_price: z.number().nullable(),
    retail_price: z.number().nullable(),
    option_values: z.array(
      z.object({
        id: z.number(),
        label: z.string(),
        option_id: z.number(),
        option_display_name: z.string(),
      }),
    ),
    inventory_level: z.number().optional(),
    inventory_warning_level: z.number().optional(),
  })
  .transform(
    (data): Variant => ({
      id: data.id,
      productId: data.product_id,
      sku: data.sku,
      price: data.price ?? undefined,
      salePrice: data.sale_price ?? undefined,
      retailPrice: data.retail_price ?? undefined,
      optionValues: data.option_values.map((option) => ({
        id: option.id,
        label: option.label,
        optionId: option.option_id,
        optionDisplayName: option.option_display_name,
      })),
      inventoryLevel: data.inventory_level,
      inventoryWarningLevel: data.inventory_warning_level,
    }),
  );

const VariantCreateSchema = z.object({
  sku: z.string(),
  option_values: z.array(
    z.object({
      label: z.string(),
      option_display_name: z.string(),
    }),
  ),
  price: z.number().optional(),
  sale_price: z.number().optional(),
  retail_price: z.number().optional(),
  inventory_level: z.number().optional(),
  inventory_warning_level: z.number().optional(),
});

const ProductSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    sku: z.string(),
    price: z.number(),
    retail_price: z.number(),
    sale_price: z.number(),
    custom_url: z.object({
      url: z.string(),
    }),
    variants: z.array(VariantSchema).default([]),
    categories: z.array(z.number()).default([]),
    inventory_level: z.number().optional(),
    inventory_warning_level: z.number().optional(),
    inventory_tracking: z.enum(['none', 'product', 'variant']).optional(),
  })
  .transform(
    (data): Product => ({
      id: data.id,
      name: data.name,
      description: data.description,
      sku: data.sku,
      price: data.price,
      retailPrice: data.retail_price,
      salePrice: data.sale_price,
      path: data.custom_url.url,
      variants: data.variants,
      categories: data.categories,
      inventoryLevel: data.inventory_level,
      inventoryWarningLevel: data.inventory_warning_level,
      inventoryTracking: data.inventory_tracking,
    }),
  );

const ProductCreateSchema = z.object({
  name: z.string(),
  weight: z.number(),
  price: z.number(),
  sale_price: z.number().optional(),
  retail_price: z.number().optional(),
  sku: z.string().optional(),
  type: z.enum(['physical', 'digital']).optional(),
  description: z.string().optional(),
  is_visible: z.boolean().optional(),
  variants: z.array(VariantCreateSchema).optional(),
  categories: z.array(z.number()).optional(),
  inventory_level: z.number().optional(),
  inventory_warning_level: z.number().optional(),
  inventory_tracking: z.enum(['none', 'product', 'variant']).optional(),
});

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

const transformCreateVariantData = (data: CreateVariantData) =>
  VariantCreateSchema.parse({
    sku: data.sku,
    option_values: data.optionValues.map((option) => ({
      label: option.label,
      option_display_name: option.optionDisplayName,
    })),
    price: data.price,
    sale_price: data.salePrice,
    retail_price: data.retailPrice,
    inventory_level: data.inventoryLevel,
    inventory_warning_level: data.inventoryWarningLevel,
  });

const transformCreateProductData = (data: CreateProductData) =>
  ProductCreateSchema.parse({
    name: data.name,
    weight: data.weight,
    price: data.price,
    sku: data.sku,
    type: data.type,
    description: data.description,
    is_visible: data.isVisible ?? true,
    variants: data.variants?.map(transformCreateVariantData),
    categories: data.categories,
    inventory_level: data.inventoryLevel,
    inventory_warning_level: data.inventoryWarningLevel,
    inventory_tracking: data.inventoryTracking,
  });

export const catalogHttpClient: CatalogApi = {
  getProductById: async (id: number): Promise<Product> => {
    const resp = await httpClient
      .get(`/v3/catalog/products/${id}?include=variants`)
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
  createProduct: async (data): Promise<Product> => {
    const resp = await httpClient
      .post('/v3/catalog/products', transformCreateProductData(data))
      .parse(apiResponseSchema(ProductSchema));

    const product = resp.data;

    // Assign the product to the channel
    await httpClient.put('/v3/catalog/products/channel-assignments', [
      {
        product_id: product.id,
        channel_id: testEnv.BIGCOMMERCE_CHANNEL_ID ?? 1,
      },
    ]);

    return product;
  },
  deleteProducts: async (ids: number[]): Promise<void> => {
    if (ids.length > 0) {
      await httpClient.delete(`/v3/catalog/products?id:in=${ids.join(',')}`);
    }
  },
};
