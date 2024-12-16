import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';
import { z } from 'zod';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { PaginationFragment } from '~/client/fragments/pagination';
import { graphql, VariablesOf } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { ProductCardFragment } from '~/components/product-card/fragment';

const GetProductSearchResultsQuery = graphql(
  `
    query GetProductSearchResultsQuery(
      $first: Int
      $last: Int
      $after: String
      $before: String
      $filters: SearchProductsFiltersInput!
      $sort: SearchProductsSortInput
    ) {
      site {
        search {
          searchProducts(filters: $filters, sort: $sort) {
            products(first: $first, after: $after, last: $last, before: $before) {
              pageInfo {
                ...PaginationFragment
              }
              collectionInfo {
                totalItems
              }
              edges {
                node {
                  ...ProductCardFragment
                }
              }
            }
            filters {
              edges {
                node {
                  __typename
                  name
                  isCollapsedByDefault
                  ... on BrandSearchFilter {
                    displayProductCount
                    brands {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          entityId
                          name
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on CategorySearchFilter {
                    displayProductCount
                    categories {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          entityId
                          name
                          isSelected
                          productCount
                          subCategories {
                            pageInfo {
                              ...PaginationFragment
                            }
                            edges {
                              cursor
                              node {
                                entityId
                                name
                                isSelected
                                productCount
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  ... on ProductAttributeSearchFilter {
                    displayProductCount
                    filterName
                    attributes {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          value
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on RatingSearchFilter {
                    ratings {
                      pageInfo {
                        ...PaginationFragment
                      }
                      edges {
                        cursor
                        node {
                          value
                          isSelected
                          productCount
                        }
                      }
                    }
                  }
                  ... on PriceSearchFilter {
                    selected {
                      minPrice
                      maxPrice
                    }
                  }
                  ... on OtherSearchFilter {
                    displayProductCount
                    freeShipping {
                      isSelected
                      productCount
                    }
                    isFeatured {
                      isSelected
                      productCount
                    }
                    isInStock {
                      isSelected
                      productCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
  [PaginationFragment, ProductCardFragment],
);

type Variables = VariablesOf<typeof GetProductSearchResultsQuery>;
type SearchProductsSortInput = Variables['sort'];
type SearchProductsFiltersInput = Variables['filters'];

interface ProductSearch {
  limit?: number | null;
  before?: string | null;
  after?: string | null;
  sort?: SearchProductsSortInput | null;
  filters: SearchProductsFiltersInput;
}

const getProductSearchResults = cache(
  async ({ limit = 9, after, before, sort, filters }: ProductSearch) => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const filterArgs = { filters, sort };
    const paginationArgs = before ? { last: limit, before } : { first: limit, after };

    const response = await client.fetch({
      document: GetProductSearchResultsQuery,
      variables: { ...filterArgs, ...paginationArgs },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate: 300 } },
    });

    const { site } = response.data;

    const searchResults = site.search.searchProducts;

    const items = removeEdgesAndNodes(searchResults.products).map((product) => ({
      ...product,
      fetchOptions: { next: { revalidate } },
    }));

    return {
      facets: {
        items: removeEdgesAndNodes(searchResults.filters).map((node) => {
          switch (node.__typename) {
            case 'BrandSearchFilter':
              return {
                ...node,
                brands: removeEdgesAndNodes(node.brands),
              };

            case 'CategorySearchFilter':
              return {
                ...node,
                categories: removeEdgesAndNodes(node.categories),
              };

            case 'ProductAttributeSearchFilter':
              return {
                ...node,
                attributes: removeEdgesAndNodes(node.attributes),
              };

            case 'RatingSearchFilter':
              return {
                ...node,
                ratings: removeEdgesAndNodes(node.ratings),
              };

            default:
              return node;
          }
        }),
      },
      products: {
        collectionInfo: searchResults.products.collectionInfo,
        pageInfo: searchResults.products.pageInfo,
        items,
      },
    };
  },
);

const SearchParamSchema = z.union([z.string(), z.array(z.string()), z.undefined()]);

const SearchParamToArray = SearchParamSchema.transform((value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value !== '') {
    return [value];
  }

  return undefined;
});

const PrivateSortParam = z.union([
  z.literal('A_TO_Z'),
  z.literal('BEST_REVIEWED'),
  z.literal('BEST_SELLING'),
  z.literal('FEATURED'),
  z.literal('HIGHEST_PRICE'),
  z.literal('LOWEST_PRICE'),
  z.literal('NEWEST'),
  z.literal('RELEVANCE'),
  z.literal('Z_TO_A'),
]) satisfies z.ZodType<SearchProductsSortInput>;

const PublicSortParam = z.string().toUpperCase().pipe(PrivateSortParam);

const SearchProductsFiltersInputSchema = z.object({
  brandEntityIds: z.array(z.number()).nullish(),
  categoryEntityId: z.number().nullish(),
  categoryEntityIds: z.array(z.number()).nullish(),
  hideOutOfStock: z.boolean().nullish(),
  isFeatured: z.boolean().nullish(),
  isFreeShipping: z.boolean().nullish(),
  price: z
    .object({
      maxPrice: z.number().nullish(),
      minPrice: z.number().nullish(),
    })
    .nullish(),
  productAttributes: z
    .array(
      z.object({
        attribute: z.string(),
        values: z.array(z.string()),
      }),
    )
    .nullish(),
  rating: z
    .object({
      maxRating: z.number().nullish(),
      minRating: z.number().nullish(),
    })
    .nullish(),
  searchSubCategories: z.boolean().nullish(),
  searchTerm: z.string().nullish(),
}) satisfies z.ZodType<SearchProductsFiltersInput>;

const PrivateSearchParamsSchema = z.object({
  after: z.string().nullish(),
  before: z.string().nullish(),
  limit: z.number().nullish(),
  sort: PrivateSortParam.nullish(),
  filters: SearchProductsFiltersInputSchema,
});

export const PublicSearchParamsSchema = z.object({
  after: z.string().nullish(),
  before: z.string().nullish(),
  brand: SearchParamToArray.nullish().transform((value) => value?.map(Number)),
  category: z.coerce.number().optional(),
  categoryIn: SearchParamToArray.nullish().transform((value) => value?.map(Number)),
  isFeatured: z.coerce.boolean().nullish(),
  limit: z.coerce.number().nullish(),
  minPrice: z.coerce.number().nullish(),
  maxPrice: z.coerce.number().nullish(),
  minRating: z.coerce.number().nullish(),
  maxRating: z.coerce.number().nullish(),
  sort: PublicSortParam.nullish(),
  // In the future we should support more stock filters, e.g. out of stock, low stock, etc.
  stock: SearchParamToArray.nullish().transform((value) =>
    value?.filter((stock) => z.enum(['in_stock']).safeParse(stock).success),
  ),
  // In the future we should support more shipping filters, e.g. 2 day shipping, same day, etc.
  shipping: SearchParamToArray.nullish().transform((value) =>
    value?.filter((stock) => z.enum(['free_shipping']).safeParse(stock).success),
  ),
  term: z.string().nullish(),
});

const AttributeKey = z.custom<`attr_${string}`>((val) => {
  return typeof val === 'string' ? /^attr_\w+$/.test(val) : false;
});

export const PublicToPrivateParams = PublicSearchParamsSchema.catchall(SearchParamToArray.nullish())
  .transform((publicParams) => {
    const { after, before, limit, sort, ...filters } = publicParams;

    const {
      brand,
      category,
      categoryIn,
      isFeatured,
      minPrice,
      maxPrice,
      minRating,
      maxRating,
      term,
      shipping,
      stock,
      // There is a bug in Next.js that is adding the path params to the searchParams. We need to filter out the slug params for now.
      // https://github.com/vercel/next.js/issues/51802
      slug,
      ...additionalParams
    } = filters;

    // Assuming the rest of the params are product attributes for now. We need to see if we can get the GQL endpoint to ingore unknown params.
    const productAttributes = Object.entries(additionalParams)
      .filter(([attribute]) => AttributeKey.safeParse(attribute).success)
      .filter(([, values]) => values != null)
      .map(([attribute, values]) => ({
        attribute: attribute.replace('attr_', ''),
        values,
      }));

    return {
      after,
      before,
      limit,
      sort,
      filters: {
        brandEntityIds: brand,
        categoryEntityId: category,
        categoryEntityIds: categoryIn,
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
        productAttributes,
        rating:
          minRating || maxRating
            ? {
                maxRating,
                minRating,
              }
            : undefined,
        searchTerm: term,
      },
    };
  })
  .pipe(PrivateSearchParamsSchema);

export const fetchFacetedSearch = cache(
  // We need to make sure the reference passed into this function is the same if we want it to be memoized.
  async (params: z.input<typeof PublicSearchParamsSchema>) => {
    const { after, before, limit = 9, sort, filters } = PublicToPrivateParams.parse(params);

    return getProductSearchResults({
      after,
      before,
      limit,
      sort,
      filters,
    });
  },
);
