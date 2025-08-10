import { graphql } from '~/client/graphql';
import { cache } from 'react';
import { client } from '~/client';
import { getBrandsRest } from '~/client/queries/get-brands';
import { revalidate } from '~/client/revalidate-target';
import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';

const convertRestPageInfoIntoGraphQL = (
  restPageInfo:
    | {
        total: number;
        count: number;
        per_page: number;
        current_page: number;
        total_pages: number;
      }
    | undefined,
) => {
  if (!restPageInfo) return null;

  return {
    startCursorParamName: 'page',
    startCursor: restPageInfo.current_page ? String(restPageInfo.current_page) : null,
    endCursorParamName: 'page',
    endCursor: restPageInfo.current_page ? String(restPageInfo.current_page + 1) : null,
  };
};

// Fetch brands using BigCommerce REST API, then fetch entities using GraphQL by entityIds
export const getBrandsData = cache(async ({ page = '1', limit = 20 } = {}) => {
  // 1. Fetch brands from REST API, sorted by name
  const restResult = await getBrandsRest({ page: parseInt(page, 1), limit });
  if (restResult.status !== 'success' || !restResult.brands) {
    return {
      brands: [],
      pageInfo: convertRestPageInfoIntoGraphQL(restResult.meta?.pagination),
      error: restResult.error,
    };
  }

  console.log('REST brands result:', restResult);
  console.log('REST result length:', restResult.brands.length);

  // 2. Extract entityIds (brand ids)
  const entityIds = restResult.brands.map((b) => b.id);
  if (!entityIds.length) {
    return {
      brands: [],
      pageInfo: convertRestPageInfoIntoGraphQL(restResult.meta?.pagination),
    };
  }

  console.log('Entity IDs:', entityIds);

  // 3. Fetch entities by entityIds using GraphQL (if needed, e.g. for richer data)
  //    Here, we use getProductsByIds as an example; replace with actual brand GraphQL query if available
  //    If not needed, you can skip this step or adjust as needed
  //    const gqlResult = await getBrandsByIds(entityIds); // If such a function exists
  const brands = await getBrandsByEntityPageQuery(entityIds);
  if (!brands) {
    return { brands: [], pageInfo: convertRestPageInfoIntoGraphQL(restResult.meta?.pagination) };
  }

  console.log('GraphQL brands result:', removeEdgesAndNodes(brands).length);

  // 4. Return brands and pagination info
  return {
    brands: removeEdgesAndNodes(brands).map((brand) => ({
      id: brand.id,
      name: brand.name,
      productsCount: brand.products?.collectionInfo?.totalItems || 0,
      path: brand.path,
      defaultImage: brand.defaultImage,
    })),
    pageInfo: convertRestPageInfoIntoGraphQL(restResult.meta?.pagination) || null,
  };
});

export const getBrandsByEntityPageQuery = cache(async (entityIds: number[]) => {
  const response = await client.fetch({
    document: BrandsByEntityPageQuery,
    variables: { entityIds },
    fetchOptions: { next: { revalidate } },
  });

  return response.data.site.brands;
});

const BrandsByEntityPageQuery = graphql(
  `
    query queryBrandsWithEntityIds($entityIds: [Int!]) {
      site {
        brands(entityIds: $entityIds) {
          edges {
            node {
              id
              name
              defaultImage {
                urlOriginal
                altText
              }
              products {
                collectionInfo {
                  totalItems
                }
              }
              path
            }
          }
        }
      }
    }
  `,
  [],
);
