import { graphql } from '~/client/graphql';
import { cache } from 'react';
import { client } from '~/client';
import { getBrandsRest } from '~/client/queries/get-brands';
import { revalidate } from '~/client/revalidate-target';

// Fetch brands using BigCommerce REST API, then fetch entities using GraphQL by entityIds
export const getBrandsData = cache(async ({ page = '1', limit = 20 } = {}) => {
  // 1. Fetch brands from REST API, sorted by name
  const restResult = await getBrandsRest({ page: parseInt(page, 10), limit });
  if (restResult.status !== 'success' || !restResult.brands) {
    return {
      brands: [],
      pageInfo: restResult.meta?.pagination,
      error: restResult.error,
    };
  }

  // 2. Extract entityIds (brand ids)
  const entityIds = restResult.brands.map((b) => b.id);
  if (!entityIds.length) {
    return {
      brands: [],
      pageInfo: restResult.meta?.pagination,
    };
  }
  // 3. Fetch entities by entityIds using GraphQL in parallel batches of 10
  const chunkArray = <T>(arr: T[], size: number): T[][] => {
    const res: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      res.push(arr.slice(i, i + size));
    }
    return res;
  };

  const entityIdChunks = chunkArray(entityIds, 10);
  const brandsResults = await Promise.all(
    entityIdChunks.map((chunk) => getBrandsByEntityPageQuery(chunk)),
  );
  // Flatten and filter out any null/undefined results, and merge all edges
  const allBrandsEdges = brandsResults
    .filter(Boolean)
    .flatMap((result) => (Array.isArray(result.edges) ? result.edges : []));
  if (!allBrandsEdges.length) {
    return { brands: [], pageInfo: restResult.meta?.pagination };
  }

  // 4. Return brands and pagination info
  return {
    brands: allBrandsEdges.map(({ node: brand }) => ({
      id: brand.id,
      name: brand.name,
      productsCount: brand.products?.collectionInfo?.totalItems || 0,
      path: brand.path,
      defaultImage: brand.defaultImage,
    })),
    pageInfo: restResult.meta?.pagination,
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
