import { useFormatter } from 'next-intl';
import { useCallback } from 'react';
import { string, z } from 'zod';

import { Product } from '@/vibes/soul/primitives/product-card';
import { pricesTransformer } from '~/data-transformers/prices-transformer';

const priceSchema = z.object({
  value: z.number(),
  currencyCode: z.string(),
});

const PricesSchema = z.object({
  price: priceSchema,
  basePrice: priceSchema.nullable(),
  retailPrice: priceSchema.nullable(),
  salePrice: priceSchema.nullable(),
  priceRange: z.object({
    min: priceSchema,
    max: priceSchema,
  }),
});

export const BcProductSchema = z.object({
  entityId: z.number(),
  name: z.string(),
  defaultImage: z.object({ altText: z.string(), url: string() }).nullable(),
  brand: z.object({ name: z.string(), path: z.string() }).nullable(),
  path: z.string(),
  prices: PricesSchema,
  reviewSummary: z
    .object({
      averageRating: z.number().optional(),
      reviewCount: z.number().optional(),
    })
    .optional(),
});

export type BcProductSchema = z.infer<typeof BcProductSchema>;

export function useBcProductToVibesProduct(): (product: BcProductSchema) => Product {
  const format = useFormatter();

  return useCallback(
    (product) => {
      const { entityId, name, defaultImage, brand, path, prices, reviewSummary } = product;

      const price = pricesTransformer(prices, format);

      return {
        id: entityId.toString(),
        title: name,
        href: path,
        image: defaultImage ? { src: defaultImage.url, alt: defaultImage.altText } : undefined,
        price,
        subtitle: brand?.name,
        rating: reviewSummary?.averageRating || 0,
        reviewCount: reviewSummary?.reviewCount || 0,
      };
    },
    [format],
  );
}
