import { SearchProductsFiltersInput, SearchProductsSortInput } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import z from 'zod';

import client from '~/client';

const SearchParamSchema = z.union([z.string(), z.array(z.string()), z.undefined()]);

const SearchParamToArray = SearchParamSchema.transform((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return [value];
  }

  return undefined;
});

const PrivateSortParam = z.enum([
  'A_TO_Z',
  'BEST_REVIEWED',
  'BEST_SELLING',
  'FEATURED',
  'HIGHEST_PRICE',
  'LOWEST_PRICE',
  'NEWEST',
  'RELEVANCE',
  'Z_TO_A',
]) satisfies z.ZodType<SearchProductsSortInput>;

const PublicSortParam = z.string().toUpperCase().pipe(PrivateSortParam);

const SearchProductsFiltersInputSchema = z.object({
  brandEntityIds: z.array(z.number()).optional(),
  categoryEntityId: z.number().optional(),
  categoryEntityIds: z.array(z.number()).optional(),
  hideOutOfStock: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isFreeShipping: z.boolean().optional(),
  price: z
    .object({
      maxPrice: z.number().optional(),
      minPrice: z.number().optional(),
    })
    .optional(),
  productAttributes: z
    .array(
      z.object({
        attribute: z.string(),
        values: z.array(z.string()),
      }),
    )
    .optional(),
  rating: z
    .object({
      maxRating: z.number().optional(),
      minRating: z.number().optional(),
    })
    .optional(),
  searchSubCategories: z.boolean().optional(),
  searchTerm: z.string().optional(),
}) satisfies z.ZodType<SearchProductsFiltersInput>;

const PrivateSearchParamsSchema = z.object({
  after: z.string().optional(),
  before: z.string().optional(),
  limit: z.number().optional(),
  sort: PrivateSortParam.optional(),
  filters: SearchProductsFiltersInputSchema.optional(),
});

const PublicSearchParamsSchema = z
  .object({
    after: z.string().optional(),
    before: z.string().optional(),
    brand: SearchParamToArray.transform((value) => value?.map(Number)),
    categoryId: z.number(),
    isFeatured: z.coerce.boolean().optional(),
    limit: z.coerce.number().optional(),
    minPrice: z.coerce.number().optional(),
    maxPrice: z.coerce.number().optional(),
    minRating: z.coerce.number().optional(),
    maxRating: z.coerce.number().optional(),
    sort: PublicSortParam.optional(),
    // In the future we should support more stock filters, e.g. out of stock, low stock, etc.
    stock: SearchParamToArray.transform((value) =>
      value?.filter((stock) => z.enum(['in_stock']).safeParse(stock).success),
    ),
    // In the future we should support more shipping filters, e.g. 2 day shipping, same day, etc.
    shipping: SearchParamToArray.transform((value) =>
      value?.filter((stock) => z.enum(['free_shipping']).safeParse(stock).success),
    ),
  })
  .catchall(SearchParamToArray);

export const PublicToPrivateParams = PublicSearchParamsSchema.transform((publicParams) => {
  const { after, before, limit, sort, ...filters } = publicParams;

  const {
    brand,
    categoryId,
    isFeatured,
    minPrice,
    maxPrice,
    minRating,
    maxRating,
    shipping,
    stock,
    // There is a bug in Next.js that is adding the path params to the searchParams. We need to filter out the slug params for now.
    // https://github.com/vercel/next.js/issues/51802
    slug,
    ...additionalParams
  } = filters;

  // Assuming the rest of the params are product attributes for now. We need to see if we can get the GQL endpoint to ingore unknown params.
  const productAttributes = Object.entries(additionalParams).map(([attribute, values]) => ({
    attribute,
    values,
  }));

  return {
    after,
    before,
    limit,
    sort,
    filters: {
      brandEntityIds: brand,
      categoryEntityId: categoryId,
      hideOutOfStock: stock?.includes('in_stock'),
      isFreeShipping: shipping?.includes('free_shipping'),
      isFeatured,
      price:
        minPrice || maxPrice
          ? {
              maxPrice,
              minPrice,
            }
          : undefined,
      productAttributes: productAttributes.length ? productAttributes : undefined,
      rating:
        minRating || maxRating
          ? {
              maxRating,
              minRating,
            }
          : undefined,
    },
  };
}).pipe(PrivateSearchParamsSchema);

export const fetchCategory = cache(
  // We need to make sure the reference passed into this function is the same if we want it to be memoized.
  async ({
    after,
    before,
    limit = 9,
    sort,
    filters,
  }: z.infer<typeof PrivateSearchParamsSchema>) => {
    return client.getProductSearchResults({
      after,
      before,
      limit,
      sort,
      filters,
    });
  },
);
